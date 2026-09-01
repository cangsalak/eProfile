import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import rateLimit from '@/lib/rate-limit';
import { loginSchema } from '@/lib/validations';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  try {
    // Rate Limit check based on IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResponse = NextResponse.next();
    try {
      await limiter.check(rateLimitResponse, 10, ip); // 10 requests per minute per IP
    } catch {
      return NextResponse.json({ error: 'เข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' }, { status: 429 });
    }

    const body = await req.json();
    
    // Zod validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }

    const { username, password } = parsed.data;

    // Find officer by username, badgeNo, or email
    const person = await prisma.personnel.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { citizenId: username.trim() },
          { badgeNo: username.trim() },
          { officialId: username.trim() },
          { email: username.trim() },
        ],
      },
    });

    if (!person) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้หรือเลขประจำตัวนี้ในระบบ' }, { status: 401 });
    }

    // Check if account is locked
    if (person.lockedUntil && person.lockedUntil > new Date()) {
      return NextResponse.json({ error: `บัญชีของคุณถูกระงับชั่วคราว กรุณาลองใหม่ในอีก ${Math.ceil((person.lockedUntil.getTime() - new Date().getTime()) / 60000)} นาที` }, { status: 403 });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, person.password);
    if (!isPasswordValid) {
      const newAttempts = person.failedLoginAttempts + 1;
      let lockedUntil = null;
      let isLocked = false;
      
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        isLocked = true;
      }
      
      await prisma.personnel.update({
        where: { id: person.id },
        data: { failedLoginAttempts: newAttempts, lockedUntil }
      });
      
      await prisma.auditLog.create({
         data: {
            action: isLocked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILED',
            entity: 'Personnel',
            entityId: person.id,
            details: isLocked ? 'Account locked due to 5 failed attempts' : 'Invalid password',
            ipAddress: ip,
            personnelId: person.id
         }
      });

      if (isLocked) {
        return NextResponse.json({ error: 'รหัสผ่านผิดเกินกำหนด บัญชีถูกระงับชั่วคราว 15 นาที' }, { status: 403 });
      }

      return NextResponse.json({ error: `รหัสผ่านไม่ถูกต้อง (ผิด ${newAttempts}/5 ครั้ง)` }, { status: 401 });
    }

    // On success, reset attempts
    if (person.failedLoginAttempts > 0 || person.lockedUntil) {
      await prisma.personnel.update({
        where: { id: person.id },
        data: { failedLoginAttempts: 0, lockedUntil: null }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_SUCCESS',
        entity: 'Personnel',
        entityId: person.id,
        details: 'User logged in successfully',
        ipAddress: ip,
        personnelId: person.id
      }
    });

    // Return authenticated user profile (excluding password)
    const { password: _, ...userProfile } = person;
    
    // Fetch permissions from SystemRole
    let permissions: string[] = [];
    const systemRole = await prisma.systemRole.findUnique({
      where: { name: person.role }
    });
    
    if (systemRole) {
      try {
        permissions = JSON.parse(systemRole.permissions || '[]');
      } catch (e) {
        console.error('Failed to parse permissions', e);
      }
    }

    // Create JWT
    const token = await new SignJWT({ 
        id: person.id, 
        role: person.role, 
        username: person.username 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(encodedSecret);

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      mustChangePassword: person.mustChangePassword,
      user: {
        ...userProfile,
        skills: JSON.parse(person.skills || '[]'),
        permissions
      },
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

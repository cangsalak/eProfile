import { NextResponse } from 'next/server';
import { prisma, rateLimit, loginSchema } from '@/modules/core';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-jwt-default-secret-change-in-production-at-least-32-bytes';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function handleLogin(req: Request) {
  try {
    const res = NextResponse.next();
    try {
      await limiter.check(res, 20, 'CACHE_TOKEN');
    } catch {
      return NextResponse.json(
        { error: 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่ (Rate limit exceeded)' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Support Login with Username OR Citizen ID OR Badge Number OR Official ID
    const user = await prisma.personnel.findFirst({
      where: {
        OR: [
          { username: username },
          { citizenId: username },
          { badgeNo: username },
          { officialId: username },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้/รหัสประจำตัว หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // ── Check Account Status (Lockout Protection) ──────────────────────────
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        { error: `บัญชีนี้ถูกระงับชั่วคราวเนื่องจากใส่รหัสผ่านผิดเกินกำหนด กรุณาลองใหม่ในอีก ${minutesLeft} นาที` },
        { status: 403 }
      );
    }

    if (user.status === 'ถูกระงับการใช้งาน' || user.status === 'พ้นสภาพ') {
      return NextResponse.json(
        { error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    if (user.status === 'รออนุมัติ') {
      return NextResponse.json(
        { error: 'บัญชีนี้อยู่ระหว่างรอการอนุมัติจากผู้ดูแลระบบ' },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const currentAttempts = (user.failedLoginAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;
      const LOCKOUT_MINUTES = 15;

      if (currentAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        await prisma.personnel.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: currentAttempts,
            lockedUntil,
          },
        });
        return NextResponse.json(
          { error: `คุณใส่รหัสผ่านผิดเกิน ${MAX_ATTEMPTS} ครั้ง บัญชีถูกระงับชั่วคราวเป็นเวลา ${LOCKOUT_MINUTES} นาที` },
          { status: 403 }
        );
      } else {
        await prisma.personnel.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: currentAttempts,
          },
        });
        return NextResponse.json(
          { error: 'ชื่อผู้ใช้/รหัสประจำตัว หรือรหัสผ่านไม่ถูกต้อง' },
          { status: 401 }
        );
      }
    }

    // Reset failed login attempts on successful login
    if ((user.failedLoginAttempts && user.failedLoginAttempts > 0) || user.lockedUntil) {
      await prisma.personnel.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
    }

    // Fetch permissions from assigned SystemRole
    let permissions: string[] = [];
    const systemRole = await prisma.systemRole.findUnique({
      where: { name: user.role },
    });

    if (systemRole) {
      try {
        permissions = JSON.parse(systemRole.permissions || '[]');
      } catch (e) {
        console.error('Failed to parse permissions', e);
      }
    }

    // Create JWT Token
    const token = await new SignJWT({
      id: user.id,
      username: user.username || user.citizenId,
      badgeNo: user.badgeNo,
      role: user.role,
      permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      subDepartment: user.subDepartment,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(encodedSecret);

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        ...userWithoutPassword,
        permissions,
      },
    });

    // Detect HTTPS
    const forwardedProto = req.headers.get('x-forwarded-proto');
    const isHttps = forwardedProto ? forwardedProto === 'https' : req.url.startsWith('https://');

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'LOGIN',
        entity: 'Personnel',
        entityId: user.id,
        details: JSON.stringify({
          role: user.role,
          department: user.department,
          subDepartment: user.subDepartment,
        }),
      },
    }).catch(() => {});

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ กรุณาลองใหม่' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ใช้/เลขประจำตัว และรหัสผ่าน' }, { status: 400 });
    }

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

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, person.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' }, { status: 401 });
    }

    // Return authenticated user profile (excluding password)
    const { password: _, ...userProfile } = person;

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
      user: {
        ...userProfile,
        skills: JSON.parse(person.skills || '[]'),
      },
    });

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && req.url.startsWith('https://'),
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

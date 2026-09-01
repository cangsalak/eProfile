import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Log audit before clearing cookie (best effort)
    const user = await verifyAuth(req);
    if (user) {
      await prisma.auditLog.create({
        data: {
          personnelId: user.id,
          action: 'LOGOUT',
          entity: 'Personnel',
          entityId: user.id,
          details: 'User logged out',
        },
      }).catch(() => {/* non-blocking */});
    }

    const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });

    // Clear the auth cookie
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    // Even on error, clear the cookie
    const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
    response.cookies.set({ name: 'auth_token', value: '', maxAge: 0, path: '/' });
    return response;
  }
}

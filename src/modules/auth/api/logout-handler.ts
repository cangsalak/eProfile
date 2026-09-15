import { NextResponse } from 'next/server';
import { verifyAuth, prisma } from '@/modules/core';

export async function handleLogout(req: Request) {
  try {
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
      }).catch(() => {});
    }

    const response = NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });

    const forwardedProto = req.headers.get('x-forwarded-proto');
    const isHttps = forwardedProto ? forwardedProto === 'https' : req.url.startsWith('https://');

    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการออกจากระบบ' }, { status: 500 });
  }
}

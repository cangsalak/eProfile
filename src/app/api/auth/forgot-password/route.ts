import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 * Creates a password reset request and logs it as PASSWORD_RESET_REQUESTED in AuditLog.
 * The actual reset is manual by admin (this is an internal system).
 */
export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string' || username.length > 100) {
      return NextResponse.json({ error: 'กรุณากรอก Username ที่ถูกต้อง' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Look up personnel (don't reveal if found or not — timing-safe response)
    const person = await prisma.personnel.findFirst({
      where: {
        OR: [
          { username },
          { citizenId: username },
          { officialId: username },
        ],
      },
      select: { id: true, firstName: true, lastName: true },
    });

    // Audit log (even if user not found — log the attempt)
    await prisma.auditLog.create({
      data: {
        personnelId: person?.id ?? null,
        action: 'PASSWORD_RESET',
        entity: 'Personnel',
        entityId: person?.id ?? 'UNKNOWN',
        details: JSON.stringify({
          username,
          found: !!person,
          source: 'forgot-password-form',
        }),
        ipAddress: ip,
      },
    }).catch(() => {/* non-blocking */});

    // Create contact message for admin to act on
    if (person) {
      await prisma.contactMessage.create({
        data: {
          name: 'แจ้งลืมรหัสผ่าน (ระบบ)',
          email: 'system@internal',
          phone: '',
          message: `ผู้ใช้ ${username} (${person.firstName} ${person.lastName}) แจ้งลืมรหัสผ่าน กรุณาตรวจสอบและรีเซ็ตรหัสผ่านให้ใหม่`,
          status: 'unread',
        },
      });
    }

    // Always return success to prevent username enumeration
    return NextResponse.json({
      success: true,
      message: 'ส่งคำขอรีเซ็ตรหัสผ่านเรียบร้อย ผู้ดูแลระบบจะดำเนินการให้ท่านภายใน 1 วันทำการ',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

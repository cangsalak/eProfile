import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordWithTokenSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 * Validates reset token and sets the new password for the associated Personnel.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const body = await req.json().catch(() => ({}));

    const parsed = resetPasswordWithTokenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues[0]?.message || 'ข้อมูลรหัสผ่านไม่ถูกต้องตามเงื่อนไขความปลอดภัย',
      }, { status: 400 });
    }

    const { token, newPassword } = parsed.data;

    // Find the token in the database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { personnel: true },
    });

    if (!resetRecord) {
      return NextResponse.json({
        error: 'ลิงก์หรือโทเค็นสำหรับรีเซ็ตรหัสผ่านไม่ถูกต้อง หรือถูกใช้งานไปแล้ว',
      }, { status: 400 });
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: resetRecord.id } }).catch(() => {});
      return NextResponse.json({
        error: 'โทเค็นหมดอายุแล้ว (มีอายุ 15 นาที) กรุณาทำรายการขอรีเซ็ตรหัสผ่านใหม่อีกครั้ง',
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the personnel password inside a transaction
    await prisma.$transaction([
      prisma.personnel.update({
        where: { id: resetRecord.personnelId },
        data: {
          password: hashedPassword,
        },
      }),
      // Invalidate/delete all reset tokens for this personnel
      prisma.passwordResetToken.deleteMany({
        where: { personnelId: resetRecord.personnelId },
      }),
      // Create Audit Log
      prisma.auditLog.create({
        data: {
          personnelId: resetRecord.personnelId,
          action: 'PASSWORD_RESET_COMPLETED',
          entity: 'Personnel',
          entityId: resetRecord.personnelId,
          details: JSON.stringify({
            username: resetRecord.personnel.username,
            method: 'self-service-token',
          }),
          ipAddress: ip,
        },
      }),
      // Create user notification
      prisma.notification.create({
        data: {
          personnelId: resetRecord.personnelId,
          title: 'รหัสผ่านของคุณได้รับการเปลี่ยนสำเร็จ',
          message: `รหัสผ่านบัญชี ${resetRecord.personnel.username} ได้รับการตั้งค่าใหม่เรียบร้อยแล้วเมื่อ ${new Date().toLocaleString('th-TH')}`,
          type: 'success',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านใหม่สำเร็จแล้ว ท่านสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่ กรุณาลองใหม่อีกครั้ง',
    }, { status: 500 });
  }
}

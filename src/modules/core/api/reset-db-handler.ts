import { NextResponse } from 'next/server';
import { prisma, requireRole, createAuditLog, getClientIp } from '@/modules/core';
import bcrypt from 'bcryptjs';

export async function handleResetDatabase(req: Request) {
  try {
    // 1. Strict RBAC: Only SUPER_ADMIN is allowed to reset the database
    const { user: authUser, error: authError } = await requireRole(req, ['SUPER_ADMIN']);
    if (authError || !authUser) {
      return authError || NextResponse.json({ error: 'Unauthorized: Only SUPER_ADMIN can reset database' }, { status: 403 });
    }

    const body = await req.json();
    const { password, confirmText, mode = 'wipe_data_keep_admin' } = body;

    // 2. Validate Confirmation Phrase
    if (confirmText !== 'RESET-DATABASE') {
      return NextResponse.json({ error: 'ข้อความยืนยันไม่ถูกต้อง กรุณาพิมพ์คำว่า RESET-DATABASE' }, { status: 400 });
    }

    // 3. Re-verify Super Admin Password
    const currentAdmin = await prisma.personnel.findUnique({
      where: { id: authUser.id },
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลผู้ดูแลระบบ' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, currentAdmin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง' }, { status: 401 });
    }

    // 4. Perform Data Wipe
    if (mode === 'factory_reset') {
      // Complete Factory Reset: Clear all records and mark uninstalled
      await prisma.$transaction([
        prisma.inspectionFinding.deleteMany(),
        prisma.inspection.deleteMany(),
        prisma.personnelDocument.deleteMany(),
        prisma.leaveRecord.deleteMany(),
        prisma.contactMessage.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.post.deleteMany(),
        prisma.mediaFile.deleteMany(),
        prisma.passwordResetToken.deleteMany(),
        prisma.calendarEvent.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.department.deleteMany(),
        prisma.personnel.deleteMany(),
        prisma.systemSetting.upsert({
          where: { key: 'isInstalled' },
          update: { value: 'false' },
          create: { key: 'isInstalled', value: 'false' },
        }),
      ]);

      return NextResponse.json({
        success: true,
        mode: 'factory_reset',
        message: 'คืนค่าโรงงานเรียบร้อยแล้ว ระบบจะเปลี่ยนเส้นทางไปยังหน้าติดตั้งระบบใหม่',
      });
    }

    // Default mode: wipe_data_keep_admin
    await prisma.$transaction([
      prisma.inspectionFinding.deleteMany(),
      prisma.inspection.deleteMany(),
      prisma.personnelDocument.deleteMany(),
      prisma.leaveRecord.deleteMany(),
      prisma.contactMessage.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.post.deleteMany(),
      prisma.mediaFile.deleteMany(),
      prisma.passwordResetToken.deleteMany(),
      prisma.calendarEvent.deleteMany(),
      // Delete non-admin personnel
      prisma.personnel.deleteMany({
        where: {
          role: { not: 'SUPER_ADMIN' },
        },
      }),
    ]);

    // Record critical audit log
    await createAuditLog({
      personnelId: authUser.id,
      action: 'DATABASE_RESET_WIPE',
      entity: 'Database',
      entityId: 'SYSTEM',
      details: JSON.stringify({
        mode,
        executedBy: authUser.username,
        ip: getClientIp(req),
      }),
    });

    return NextResponse.json({
      success: true,
      mode: 'wipe_data_keep_admin',
      message: 'ล้างข้อมูลระบบเรียบร้อยแล้ว (คงเหลือเฉพาะบัญชีผู้ดูแลระบบสูงสุด)',
    });
  } catch (error: any) {
    console.error('Failed to reset database:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

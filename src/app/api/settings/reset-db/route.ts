import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireRole } from '@/lib/auth-guards';
import { createAuditLog, getClientIp } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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
      where: { id: authUser.id }
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
        prisma.vehicle.deleteMany(),
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
          create: { key: 'isInstalled', value: 'false' }
        }),
      ]);

      return NextResponse.json({
        success: true,
        mode: 'factory_reset',
        message: 'รีเซ็ตระบบกลับสู่ค่าเริ่มต้นจากโรงงาน (Factory Reset) สำเร็จ! ระบบจะเปลี่ยนเส้นทางไปยังหน้าติดตั้ง',
        redirectUrl: '/install'
      });
    }

    // Default: Wipe records but keep current Super Admin and system settings
    await prisma.$transaction([
      prisma.inspectionFinding.deleteMany(),
      prisma.inspection.deleteMany(),
      prisma.personnelDocument.deleteMany(),
      prisma.leaveRecord.deleteMany(),
      prisma.vehicle.deleteMany(),
      prisma.contactMessage.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.post.deleteMany(),
      prisma.mediaFile.deleteMany(),
      prisma.passwordResetToken.deleteMany(),
      prisma.calendarEvent.deleteMany(),
      // Delete all personnel except current Super Admin
      prisma.personnel.deleteMany({
        where: {
          id: { not: currentAdmin.id }
        }
      }),
    ]);

    // Record Audit Log for the wipe action
    await createAuditLog({
      req,
      personnelId: currentAdmin.id,
      action: 'DATABASE_WIPED',
      entity: 'SystemDatabase',
      details: { mode, initiatedBy: currentAdmin.username },
    });

    return NextResponse.json({
      success: true,
      mode: 'wipe_data_keep_admin',
      message: 'ล้างข้อมูลบุคลากรและประวัติการใช้งานทั้งหมดเรียบร้อยแล้ว โดยยังคงเก็บบัญชีผู้ดูแลระบบปัจจุบันไว้'
    });

  } catch (error: any) {
    console.error('Error resetting database:', error);
    return NextResponse.json({
      error: `เกิดข้อผิดพลาดในการล้างฐานข้อมูล: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}

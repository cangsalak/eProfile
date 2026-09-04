import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// GET: Public status of maintenance mode
export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['maintenanceMode', 'maintenanceMessage', 'maintenanceEndTime'] }
      }
    });

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      isMaintenance: settingsMap.maintenanceMode === 'true',
      message: settingsMap.maintenanceMessage || 'ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก',
      endTime: settingsMap.maintenanceEndTime || '',
    });
  } catch (error: any) {
    return NextResponse.json({
      isMaintenance: false,
      message: 'ระบบกำลังอยู่ระหว่างการปรับปรุง',
      error: error?.message,
    }, { status: 500 });
  }
}

// POST: Admin endpoint to toggle maintenance mode
export async function POST(req: Request) {
  try {
    const { user: authUser, error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError || !authUser) {
      return authError || NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const { isMaintenance, message, endTime } = body;

    const maintenanceVal = isMaintenance ? 'true' : 'false';
    const messageVal = message ? String(message).trim() : 'ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก';
    const endTimeVal = endTime ? String(endTime).trim() : '';

    await prisma.$transaction([
      prisma.systemSetting.upsert({
        where: { key: 'maintenanceMode' },
        update: { value: maintenanceVal },
        create: { key: 'maintenanceMode', value: maintenanceVal },
      }),
      prisma.systemSetting.upsert({
        where: { key: 'maintenanceMessage' },
        update: { value: messageVal },
        create: { key: 'maintenanceMessage', value: messageVal },
      }),
      prisma.systemSetting.upsert({
        where: { key: 'maintenanceEndTime' },
        update: { value: endTimeVal },
        create: { key: 'maintenanceEndTime', value: endTimeVal },
      }),
    ]);

    // Record Audit Log
    await createAuditLog({
      req,
      personnelId: authUser.id,
      action: isMaintenance ? 'MAINTENANCE_MODE_ENABLED' : 'MAINTENANCE_MODE_DISABLED',
      entity: 'SystemSetting',
      details: { isMaintenance, message: messageVal, endTime: endTimeVal, updatedBy: authUser.username },
    });

    return NextResponse.json({
      success: true,
      isMaintenance: isMaintenance === true,
      message: messageVal,
      endTime: endTimeVal,
      notice: isMaintenance
        ? 'เปิดใช้งานโหมดปิดปรับปรุงเว็บไซต์เรียบร้อยแล้ว'
        : 'ปิดโหมดปรับปรุงเว็บไซต์ ระบบเปิดให้บริการตามปกติแล้ว',
    });
  } catch (error: any) {
    console.error('Error updating maintenance settings:', error);
    return NextResponse.json({
      error: `เกิดข้อผิดพลาดในการบันทึก: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}

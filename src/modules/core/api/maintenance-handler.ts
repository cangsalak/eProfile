import { NextResponse } from 'next/server';
import { prisma, requireRole, createAuditLog } from '@/modules/core';

export async function handleGetMaintenance() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['maintenanceMode', 'maintenanceMessage', 'maintenanceEndTime'] },
      },
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

export async function handleUpdateMaintenance(req: Request) {
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

    await createAuditLog({
      personnelId: authUser.id,
      action: isMaintenance ? 'ENABLE_MAINTENANCE_MODE' : 'DISABLE_MAINTENANCE_MODE',
      entity: 'SystemSetting',
      entityId: 'maintenanceMode',
      details: JSON.stringify({
        isMaintenance,
        message: messageVal,
        endTime: endTimeVal,
      }),
    });

    return NextResponse.json({
      success: true,
      isMaintenance,
      message: messageVal,
      endTime: endTimeVal,
    });
  } catch (error: any) {
    console.error('Failed to update maintenance mode:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

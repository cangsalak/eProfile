import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array to key-value object
    const settingsObj = settings.reduce((acc: any, curr) => {
      // Do not return sensitive information that might still be in DB
      if (['smtpPass', 'lineNotifyToken', 'smtpUser', 'smtpHost', 'smtpPort'].includes(curr.key)) {
        return acc;
      }
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    // Add default isInstalled if not present
    if (typeof settingsObj.isInstalled === 'undefined') {
      settingsObj.isInstalled = 'false';
    }

    // Default dropdown options if not yet set in database
    if (!settingsObj.personnelTypes) {
      settingsObj.personnelTypes = JSON.stringify(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']);
    }
    if (!settingsObj.statusList) {
      settingsObj.statusList = JSON.stringify(['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ']);
    }
    if (!settingsObj.prefixes) {
      settingsObj.prefixes = JSON.stringify(['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.']);
    }
    if (!settingsObj.leaveTypes) {
      settingsObj.leaveTypes = JSON.stringify(['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ']);
    }
    if (!settingsObj.vehicleTypes) {
      settingsObj.vehicleTypes = JSON.stringify(['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ']);
    }
    if (!settingsObj.bloodGroups) {
      settingsObj.bloodGroups = JSON.stringify(['A', 'B', 'AB', 'O']);
    }
    if (!settingsObj.educationLevels) {
      settingsObj.educationLevels = JSON.stringify(['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก']);
    }

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { error: authError, user: authUser } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // Save each setting to the DB using upsert
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    
    // Audit log: SETTINGS_CHANGED
    const changedKeys = Object.keys(body).filter(k => typeof body[k] === 'string');
    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action: 'SETTINGS_CHANGED',
        entity: 'SystemSetting',
        entityId: 'settings',
        details: JSON.stringify({ changedKeys }),
      },
    }).catch(() => {/* non-blocking */});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

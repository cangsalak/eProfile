import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

/**
 * Keys returned to unauthenticated (public) callers.
 * NEVER add sensitive keys here (db connection strings, SMTP, tokens, etc.).
 *
 * Security: using an allowlist (not denylist) ensures future keys added to
 * the DB are NOT exposed by default.
 */
const PUBLIC_SETTINGS_ALLOWLIST = new Set([
  'isInstalled',
  'systemName',
  'systemLogo',
  'systemDescription',
  'defaultPageSize',
  'theme',
  // Dropdown options needed by public-facing pages
  'personnelTypes',
  'statusList',
  'prefixes',
  'leaveTypes',
  'leavePolicy',
  'vehicleTypes',
  'bloodGroups',
  'educationLevels',
]);

/** Default values for public settings not yet stored in DB */
const PUBLIC_DEFAULTS: Record<string, string> = {
  isInstalled:     'false',
  defaultPageSize: '20',
  personnelTypes:  JSON.stringify(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']),
  statusList:      JSON.stringify(['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ']),
  prefixes:        JSON.stringify(['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.']),
  leaveTypes:      JSON.stringify(['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ']),
  leavePolicy:     JSON.stringify({ 'ลาพักผ่อน': 10, 'ลากิจ': 45, 'ลาป่วย': 60, 'ลาคลอดบุตร': 90, 'ลาอุปสมบท': 120 }),
  vehicleTypes:    JSON.stringify(['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ']),
  bloodGroups:     JSON.stringify(['A', 'B', 'AB', 'O']),
  educationLevels: JSON.stringify(['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก']),
};

/**
 * GET /api/settings — public endpoint, allowlist-filtered.
 *
 * Only keys in PUBLIC_SETTINGS_ALLOWLIST are returned.
 * Sensitive values (dbConnectionString, SMTP, tokens, etc.) are never exposed.
 */
export async function GET() {
  try {
    const allSettings = await prisma.systemSetting.findMany();

    // Build output from allowlist only
    const settingsObj: Record<string, string> = {};
    for (const { key, value } of allSettings) {
      if (PUBLIC_SETTINGS_ALLOWLIST.has(key)) {
        settingsObj[key] = value;
      }
    }

    // Fill in missing defaults
    for (const [key, defaultValue] of Object.entries(PUBLIC_DEFAULTS)) {
      if (!(key in settingsObj)) {
        settingsObj[key] = defaultValue;
      }
    }

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT /api/settings — requires MANAGE_SYSTEM permission.
 */
export async function PUT(request: Request) {
  try {
    const { error: authError, user: authUser } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError || !authUser) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    const changedKeys = Object.keys(body).filter(k => typeof body[k] === 'string');
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action:      'SETTINGS_CHANGED',
        entity:      'SystemSetting',
        entityId:    'settings',
        details:     JSON.stringify({ changedKeys }),
        ipAddress:   clientIp,
      },
    }).catch(() => { /* non-blocking */ });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

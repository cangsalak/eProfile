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
  'organizationName',
  'organizationAddress',
  'organizationPhone',
  'contactPhoneSecondary',
  'contactEmail',
  'contactEmailSupport',
  'contactMapEmbedUrl',
  'contactMapLink',
  'cardTermsConditions',
  'defaultPageSize',
  'theme',
  'systemColor',
  'customPrimaryColor',
  'systemFont',
  'fontSizeScale',
  'borderRadius',
  'surfaceStyle',
  'layoutDensity',
  'toastPosition',
  'toastTheme',
  'googleCalendarUrls',
  'badgeTemplate',
  'badgeColorMode',
  'badgeCustomColor',
  'badgeShowBloodType',
  'badgeShowBarcode',
  'colorCommissioned',
  'colorNonCommissioned',
  'colorConscript',
  'badgeCanvasConfig',
  'enableLineNotify',
  'enableEmailNotify',
  'notifyEmailTo',
  'dbProvider',
  'hasDemoData',
  // Dropdown options needed by public-facing pages
  'personnelTypes',
  'statusList',
  'prefixes',
  'leaveTypes',
  'leavePolicy',
  'vehicleTypes',
  'bloodGroups',
  'educationLevels',
  'enabledModules',
]);

/** Default values for public settings not yet stored in DB */
const PUBLIC_DEFAULTS: Record<string, string> = {
  isInstalled:     'false',
  dbProvider:      'sqlite',
  hasDemoData:     'false',
  defaultPageSize: '20',
  theme:           'dark',
  systemColor:     'nextadmin',
  systemFont:      'prompt',
  fontSizeScale:   '100',
  borderRadius:    'rounded',
  surfaceStyle:    'shadow',
  toastPosition:   'top-right',
  toastTheme:      'light',
  organizationAddress: 'ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
  organizationPhone:   '02-123-4567',
  contactPhoneSecondary: '02-123-4568 (ฝ่ายบริการ/สอบถาม)',
  contactEmail:        'contact@eprofile.com',
  contactEmailSupport: 'support@eprofile.com',
  contactMapEmbedUrl:  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth',
  contactMapLink:      'https://maps.google.com/?q=Government+Complex+Chaeng+Watthana',
  personnelTypes:  JSON.stringify(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']),
  statusList:      JSON.stringify(['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ']),
  prefixes:        JSON.stringify(['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.']),
  leaveTypes:      JSON.stringify(['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ']),
  leavePolicy:     JSON.stringify({ 'ลาพักผ่อน': 10, 'ลากิจ': 45, 'ลาป่วย': 60, 'ลาคลอดบุตร': 90, 'ลาอุปสมบท': 120 }),
  vehicleTypes:    JSON.stringify(['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ']),
  bloodGroups:     JSON.stringify(['A', 'B', 'AB', 'O']),
  educationLevels: JSON.stringify(['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก']),
  enabledModules:  JSON.stringify(['personnel', 'leaves', 'vehicles', 'badges', 'calendar', 'news', 'contacts', 'command-dashboard', 'system-inspector']),
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

import { NextResponse } from 'next/server';
import { prisma, requirePermission } from '@/modules/core';

export const PUBLIC_SETTINGS_ALLOWLIST = new Set([
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
  'calendarDutyRoles',
  'badgeTemplate',
  'badgeHeaderTitle',
  'badgeSubHeaderTitle',
  'badgeColorMode',
  'badgeCustomColor',
  'badgeShowBloodType',
  'badgeShowBarcode',
  'colorCommissioned',
  'colorNonCommissioned',
  'colorConscript',
  'badgeCanvasConfig',
  'badgeBackCanvasConfig',
  'enableLineNotify',
  'lineTargetId',
  'enableEmailNotify',
  'notifyEmailTo',
  'notifyEmailFromName',
  'notifyEmailFromAddress',
  'notifyDutyDaily',
  'notifyDutyUpcoming',
  'notifyDutyChange',
  'dutyDailyTime',
  'dutyReminderHour',
  'leaveDefaultQuota',
  'leaveQuotaSick',
  'leaveQuotaPersonal',
  'leaveQuotaVacation',
  'leaveQuotaOrdination',
  'leaveQuotaMilitary',
  'leaveQuotaMaternity',
  'leaveApproverRole',
  'leaveAllowOverQuota',
  'leaveRequireDocument',
  'leaveAdvanceDays',
  'leaveCancelAllowed',
  'securityMinPasswordLength',
  'securityRequireUppercase',
  'securityRequireNumbers',
  'securityRequireSymbols',
  'securityPasswordExpireDays',
  'securityMaxLoginAttempts',
  'securityLockoutDurationMinutes',
  'securitySessionTimeoutMinutes',
  'securityEnforce2FA',
  'securityAllowSelfRegister',
  'securityShowCaptchaOnLogin',
  's3Provider',
  's3Endpoint',
  's3Region',
  's3Bucket',
  's3AccessKeyId',
  's3SecretAccessKey',
  's3PublicUrl',
  's3PathPrefix',
  's3ForcePathStyle',
  's3StorageClass',
  's3MaxFileSizeMB',
  's3AllowedMimeTypes',
  's3UploadTimeoutSec',
  's3EnableDirectUpload',
  's3AutoThumbnail',
  's3RetainDays',
  's3CorsOrigins',
  's3HealthCheckIntervalMin',
  's3ActiveConfigId',
  's3Configs',
  'maintenanceMode',
  'maintenanceMessage',
  'maintenanceEndTime',
  'developerCreditText',
  'developerCreditUrl',
  'developerCreditShow',
  'developerCreditCustomText',
  'developerCreditCustomUrl',
  'developerCreditCustomIcon',
  'developerCreditPosition',
  'developerCreditTheme',
  'developerCreditYear',
  'qrPaymentEnabled',
  'qrPaymentPromptPayId',
  'qrPaymentAccountName',
  'qrPaymentBank',
  'qrPaymentAccountNumber',
  'qrPaymentAmount',
  'qrPaymentDescription',
  'qrPaymentShowOnCard',
  'qrPaymentShowOnProfile',
  'qrPaymentShowOnFooter',
  'qrPaymentCustomNote',
  'qrPaymentExpireMinutes',
]);

export async function handleGetSettings(req: Request) {
  try {
    const isPublic = new URL(req.url).searchParams.get('public') === 'true';

    if (!isPublic) {
      const { user: authUser } = await requirePermission(req, 'MANAGE_SETTINGS');
      if (authUser) {
        const allSettings = await prisma.systemSetting.findMany();
        const settingsMap: Record<string, string> = {};
        for (const item of allSettings) {
          settingsMap[item.key] = item.value;
        }
        return NextResponse.json(settingsMap);
      }
    }

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: Array.from(PUBLIC_SETTINGS_ALLOWLIST) },
      },
    });

    const settingsMap: Record<string, string> = {};
    for (const item of settings) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Failed to fetch settings (database may not be initialized yet):', error);
    return NextResponse.json({
      isInstalled: 'false',
      systemName: 'eProfile',
      theme: 'dark',
      enabledModules: '[]',
    });
  }
}

export async function handleUpdateSettings(req: Request) {
  try {
    const { user: authUser, error: authError } = await requirePermission(req, 'MANAGE_SETTINGS');
    if (authError || !authUser) {
      return authError || NextResponse.json({ error: 'Unauthorized: Permission MANAGE_SETTINGS required' }, { status: 403 });
    }

    const body = await req.json();

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid settings payload: expected an object' }, { status: 400 });
    }

    const updates = Object.entries(body).map(([key, value]) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

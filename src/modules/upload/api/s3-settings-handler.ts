import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { getStorageConfig, testS3Connection, StorageConfig } from '../lib/s3-client';

export async function handleGetStorageSettings(req: Request) {
  try {
    const { user, error: authError } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getStorageConfig();

    return NextResponse.json({
      provider: config.provider,
      s3Endpoint: config.s3Endpoint || '',
      s3Region: config.s3Region || 'ap-southeast-1',
      s3Bucket: config.s3Bucket || '',
      s3AccessKeyId: config.s3AccessKeyId ? `${config.s3AccessKeyId.substring(0, 4)}••••••••` : '',
      s3SecretAccessKey: config.s3SecretAccessKey ? '••••••••••••••••' : '',
      hasSecretKey: !!config.s3SecretAccessKey,
      s3PublicUrl: config.s3PublicUrl || '',
      s3ForcePathStyle: !!config.s3ForcePathStyle,
    });
  } catch (error: any) {
    console.error('Failed to get storage settings:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถโหลดการตั้งค่าจัดเก็บข้อมูลได้' }, { status: 500 });
  }
}

export async function handleSaveStorageSettings(req: Request) {
  try {
    const { user, error: authError } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      provider = 'LOCAL',
      s3Endpoint = '',
      s3Region = 'ap-southeast-1',
      s3Bucket = '',
      s3AccessKeyId = '',
      s3SecretAccessKey = '',
      s3PublicUrl = '',
      s3ForcePathStyle = false,
    } = body;

    const currentConfig = await getStorageConfig();

    const updates: { key: string; value: string }[] = [
      { key: 'storage_provider', value: provider },
      { key: 'storage_s3_endpoint', value: s3Endpoint },
      { key: 'storage_s3_region', value: s3Region },
      { key: 'storage_s3_bucket', value: s3Bucket },
      { key: 'storage_s3_public_url', value: s3PublicUrl },
      { key: 'storage_s3_force_path_style', value: String(!!s3ForcePathStyle) },
    ];

    // Only update access keys if provided and not masked
    if (s3AccessKeyId && !s3AccessKeyId.includes('••••')) {
      updates.push({ key: 'storage_s3_access_key', value: s3AccessKeyId });
    }
    if (s3SecretAccessKey && !s3SecretAccessKey.includes('••••')) {
      updates.push({ key: 'storage_s3_secret_key', value: s3SecretAccessKey });
    }

    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'UPDATE_STORAGE_SETTINGS',
        entity: 'SystemSetting',
        details: JSON.stringify({
          provider,
          s3Bucket,
          s3Endpoint,
          s3Region,
          s3ForcePathStyle,
        }),
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าระบบจัดเก็บข้อมูลเรียบร้อยแล้ว',
    });
  } catch (error: any) {
    console.error('Failed to save storage settings:', error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' }, { status: 500 });
  }
}

export async function handleTestStorageConnection(req: Request) {
  try {
    const { user, error: authError } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const currentConfig = await getStorageConfig();

    const testConfig: StorageConfig = {
      provider: 'S3',
      s3Endpoint: body.s3Endpoint !== undefined ? body.s3Endpoint : currentConfig.s3Endpoint,
      s3Region: body.s3Region !== undefined ? body.s3Region : currentConfig.s3Region,
      s3Bucket: body.s3Bucket !== undefined ? body.s3Bucket : currentConfig.s3Bucket,
      s3AccessKeyId:
        body.s3AccessKeyId && !body.s3AccessKeyId.includes('••••')
          ? body.s3AccessKeyId
          : currentConfig.s3AccessKeyId,
      s3SecretAccessKey:
        body.s3SecretAccessKey && !body.s3SecretAccessKey.includes('••••')
          ? body.s3SecretAccessKey
          : currentConfig.s3SecretAccessKey,
      s3PublicUrl: body.s3PublicUrl !== undefined ? body.s3PublicUrl : currentConfig.s3PublicUrl,
      s3ForcePathStyle:
        body.s3ForcePathStyle !== undefined ? !!body.s3ForcePathStyle : currentConfig.s3ForcePathStyle,
    };

    const testResult = await testS3Connection(testConfig);
    return NextResponse.json(testResult);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `การทดสอบล้มเหลว: ${error.message}` },
      { status: 500 }
    );
  }
}

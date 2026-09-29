import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { prisma } from '@/modules/core';

export interface StorageConfig {
  provider: 'LOCAL' | 'S3';
  s3Endpoint?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3PublicUrl?: string;
  s3ForcePathStyle?: boolean;
}

export async function getStorageConfig(): Promise<StorageConfig> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            'storage_provider',
            'storage_s3_endpoint',
            'storage_s3_region',
            'storage_s3_bucket',
            'storage_s3_access_key',
            'storage_s3_secret_key',
            'storage_s3_public_url',
            'storage_s3_force_path_style',
          ],
        },
      },
    });

    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    return {
      provider: (map['storage_provider'] as 'LOCAL' | 'S3') || (process.env.STORAGE_PROVIDER as any) || 'LOCAL',
      s3Endpoint: map['storage_s3_endpoint'] || process.env.S3_ENDPOINT || '',
      s3Region: map['storage_s3_region'] || process.env.S3_REGION || 'ap-southeast-1',
      s3Bucket: map['storage_s3_bucket'] || process.env.S3_BUCKET || '',
      s3AccessKeyId: map['storage_s3_access_key'] || process.env.S3_ACCESS_KEY_ID || '',
      s3SecretAccessKey: map['storage_s3_secret_key'] || process.env.S3_SECRET_ACCESS_KEY || '',
      s3PublicUrl: map['storage_s3_public_url'] || process.env.S3_PUBLIC_URL || '',
      s3ForcePathStyle: map['storage_s3_force_path_style'] === 'true' || process.env.S3_FORCE_PATH_STYLE === 'true',
    };
  } catch (err) {
    console.error('Failed to load storage config from DB, falling back to ENV', err);
    return {
      provider: (process.env.STORAGE_PROVIDER as any) || 'LOCAL',
      s3Endpoint: process.env.S3_ENDPOINT || '',
      s3Region: process.env.S3_REGION || 'ap-southeast-1',
      s3Bucket: process.env.S3_BUCKET || '',
      s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      s3PublicUrl: process.env.S3_PUBLIC_URL || '',
      s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    };
  }
}

export function createS3Client(config: StorageConfig): S3Client {
  const clientConfig: any = {
    region: config.s3Region || 'ap-southeast-1',
    credentials: {
      accessKeyId: config.s3AccessKeyId || '',
      secretAccessKey: config.s3SecretAccessKey || '',
    },
    forcePathStyle: !!config.s3ForcePathStyle,
  };

  if (config.s3Endpoint && config.s3Endpoint.trim() !== '') {
    clientConfig.endpoint = config.s3Endpoint.trim();
  }

  return new S3Client(clientConfig);
}

export async function testS3Connection(config: StorageConfig): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    if (!config.s3Bucket) {
      return { success: false, message: 'กรุณาระบุชื่อ S3 Bucket' };
    }
    if (!config.s3AccessKeyId || !config.s3SecretAccessKey) {
      return { success: false, message: 'กรุณาระบุ Access Key ID และ Secret Access Key' };
    }

    const s3 = createS3Client(config);

    // 1. Check Bucket reachability
    await s3.send(
      new HeadBucketCommand({
        Bucket: config.s3Bucket,
      })
    );

    // 2. Perform test upload and delete
    const testKey = `.eprofile-healthcheck-${Date.now()}.txt`;
    await s3.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: testKey,
        Body: Buffer.from(`eProfile Healthcheck at ${new Date().toISOString()}`),
        ContentType: 'text/plain',
      })
    );

    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.s3Bucket,
        Key: testKey,
      })
    );

    return {
      success: true,
      message: `เชื่อมต่อ S3 Bucket "${config.s3Bucket}" สำเร็จ (อ่าน/เขียน พร้อมใช้งาน)`,
    };
  } catch (error: any) {
    console.error('S3 test connection failed:', error);
    return {
      success: false,
      message: `การเชื่อมต่อ S3 ล้มเหลว: ${error.message || 'Access Denied หรือ Bucket ไม่ถูกต้อง'}`,
      details: error.name || error.code,
    };
  }
}

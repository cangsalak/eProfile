import fs from 'fs';
import path from 'path';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getStorageConfig, createS3Client } from './s3-client';
import { sanitizeFilename } from './file-utils';

export interface StorageUploadResult {
  url: string;
  filename: string;
  storageKey: string;
  size: number;
  mimetype: string;
  provider: 'LOCAL' | 'S3';
}

export interface StorageUploadOptions {
  module?: string;
  folder?: string;
}

export async function uploadToStorage(
  buffer: Buffer,
  originalFilename: string,
  mimetype: string,
  options: StorageUploadOptions = {}
): Promise<StorageUploadResult> {
  const config = await getStorageConfig();
  const ext = originalFilename.includes('.') ? originalFilename.split('.').pop() : '';
  const baseName = originalFilename.includes('.')
    ? originalFilename.substring(0, originalFilename.lastIndexOf('.'))
    : originalFilename;
  const sanitized = sanitizeFilename(baseName);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const storedFilename = ext ? `${sanitized}_${timestamp}_${randomSuffix}.${ext}` : `${sanitized}_${timestamp}_${randomSuffix}`;

  // Build hierarchical folder path: uploads/<module>/[folder]/<year>/<month>/
  const mod = (options.module || 'upload').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'upload';
  const fld = options.folder ? options.folder.toLowerCase().replace(/[^a-z0-9_-]/g, '') : '';
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const subPathSegments = [mod];
  if (fld && fld !== 'general' && fld !== mod) {
    subPathSegments.push(fld);
  }
  subPathSegments.push(year, month);
  const relativeDir = subPathSegments.join('/');

  // 1. S3 Storage Upload
  if (config.provider === 'S3' && config.s3Bucket && config.s3AccessKeyId) {
    const s3 = createS3Client(config);
    const key = `uploads/${relativeDir}/${storedFilename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: config.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    // Build Public URL
    let publicUrl = '';
    if (config.s3PublicUrl && config.s3PublicUrl.trim() !== '') {
      const base = config.s3PublicUrl.replace(/\/+$/, '');
      publicUrl = `${base}/${key}`;
    } else if (config.s3Endpoint && config.s3Endpoint.trim() !== '') {
      const endpoint = config.s3Endpoint.replace(/\/+$/, '');
      if (config.s3ForcePathStyle) {
        publicUrl = `${endpoint}/${config.s3Bucket}/${key}`;
      } else {
        const urlObj = new URL(endpoint);
        publicUrl = `${urlObj.protocol}//${config.s3Bucket}.${urlObj.host}/${key}`;
      }
    } else {
      // Standard AWS S3 URL
      publicUrl = `https://${config.s3Bucket}.s3.${config.s3Region || 'ap-southeast-1'}.amazonaws.com/${key}`;
    }

    return {
      url: publicUrl,
      filename: originalFilename,
      storageKey: key,
      size: buffer.length,
      mimetype,
      provider: 'S3',
    };
  }

  // 2. Local Disk Storage (/public/uploads/<module>/<year>/<month>/...)
  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads', ...subPathSegments);
  fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, storedFilename);
  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${relativeDir}/${storedFilename}`,
    filename: originalFilename,
    storageKey: `uploads/${relativeDir}/${storedFilename}`,
    size: buffer.length,
    mimetype,
    provider: 'LOCAL',
  };
}

export async function deleteFromStorage(fileUrlOrKey: string): Promise<boolean> {
  try {
    const config = await getStorageConfig();

    if (config.provider === 'S3' && config.s3Bucket && config.s3AccessKeyId) {
      const s3 = createS3Client(config);
      let key = fileUrlOrKey;
      if (fileUrlOrKey.startsWith('http://') || fileUrlOrKey.startsWith('https://')) {
        try {
          const url = new URL(fileUrlOrKey);
          key = url.pathname.replace(/^\/+/, '');
          if (config.s3ForcePathStyle && key.startsWith(`${config.s3Bucket}/`)) {
            key = key.replace(`${config.s3Bucket}/`, '');
          }
        } catch {
          key = fileUrlOrKey;
        }
      }

      await s3.send(
        new DeleteObjectCommand({
          Bucket: config.s3Bucket,
          Key: key,
        })
      );
      return true;
    }

    // Local Disk removal (Safe path traversal check)
    if (fileUrlOrKey.startsWith('/uploads/')) {
      const relPath = fileUrlOrKey.replace(/^\/+/, '');
      const baseDir = path.resolve(process.cwd(), 'public', 'uploads');
      const filePath = path.resolve(process.cwd(), 'public', relPath);

      if (filePath.startsWith(baseDir) && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete file from storage', err);
    return false;
  }
}

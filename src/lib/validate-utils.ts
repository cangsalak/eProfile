/**
 * Validates that a string is a valid UUID v4 or CUID (used by Prisma by default).
 * This prevents path traversal and injection via ID parameters.
 */
const SAFE_ID_REGEX = /^[a-z0-9_-]{2,64}$/i;

export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return SAFE_ID_REGEX.test(id);
}

export function validateId(id: string): { valid: boolean; error?: string } {
  if (!isValidId(id)) {
    return { valid: false, error: 'Invalid ID format' };
  }
  return { valid: true };
}

/**
 * Validates file extension and MIME type for uploads.
 */
const EXTENSION_MIME_MAP: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function isSafeFilename(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false;
  return !filename.includes('..') && !filename.includes('/') && !filename.includes('\\');
}

export function isAllowedMimeType(mime: string): boolean {
  return Object.values(EXTENSION_MIME_MAP).flat().includes(mime);
}

export function validateUploadedFile(
  file: { name: string; size: number; type: string }
): { valid: boolean; error?: string } {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();

  const allowedMimes = EXTENSION_MIME_MAP[ext];
  if (!allowedMimes) {
    return { valid: false, error: `ไม่อนุญาตให้อัปโหลดไฟล์นามสกุล ${ext}` };
  }

  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: `ประเภทไฟล์ (${file.type}) ไม่ตรงกับนามสกุล (${ext})` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)' };
  }

  // Prevent path traversal in file names
  if (!isSafeFilename(file.name)) {
    return { valid: false, error: 'ชื่อไฟล์ไม่ถูกต้อง' };
  }

  return { valid: true };
}

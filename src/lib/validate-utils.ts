/**
 * Validates that a string is a valid UUID v4 or CUID (used by Prisma by default).
 * This prevents path traversal and injection via ID parameters.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CUID_REGEX = /^c[a-z0-9]{24,}$/i;

export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  // Allow UUID v4 or CUID (Prisma default)
  return UUID_REGEX.test(id) || CUID_REGEX.test(id);
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
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'ชื่อไฟล์ไม่ถูกต้อง' };
  }

  return { valid: true };
}

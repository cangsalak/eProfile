/**
 * Avatar & Image Path Resolution Utilities — eProfile System
 * Handles data URLs, local uploads (/uploads/...), remote S3/HTTP URLs, blobs, and fallback colors.
 */

/**
 * Checks whether a given string is a valid image source (Data URL, blob, HTTP URL, relative upload URL, or image extension).
 * Returns false if it is empty, null, undefined, or a CSS color (hex like #3b82f6, rgb(), hsl(), etc.).
 */
export function isImageSrc(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;

  // Hex color codes (e.g. #3b82f6, #fff, #10b981)
  if (trimmed.startsWith('#')) return false;

  // CSS functions (rgb, rgba, hsl, hsla, var)
  if (/^(rgb|rgba|hsl|hsla|var)\(/i.test(trimmed)) return false;

  // Named web colors (common defaults in case used without #)
  const commonColorNames = ['transparent', 'inherit', 'initial', 'currentcolor'];
  if (commonColorNames.includes(trimmed.toLowerCase())) return false;

  // Valid image sources
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/uploads/') ||
    trimmed.startsWith('/') ||
    /\.(png|jpe?g|webp|svg|gif|bmp|ico|avif)(\?.*)?$/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}

/**
 * Extract a valid avatar image URL from a personnel or user object.
 * Checks candidate fields in order: avatar, photo, photoUrl, avatarUrl, avatarColor.
 * Returns the URL if it is a valid image source, or null if it's absent or just a hex color.
 */
export function getPersonnelAvatarUrl(personnel?: any): string | null {
  if (!personnel) return null;
  const candidate =
    personnel.avatar ||
    personnel.photo ||
    personnel.photoUrl ||
    personnel.avatarUrl ||
    personnel.avatarColor;

  if (isImageSrc(candidate)) {
    return String(candidate).trim();
  }
  return null;
}

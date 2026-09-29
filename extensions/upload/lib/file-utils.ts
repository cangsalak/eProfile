export type FileCategory = 'all' | 'image' | 'audio' | 'video' | 'pdf' | 'document' | 'archive' | 'other';

export function getFileCategory(mimetype: string, filename = ''): FileCategory {
  const mime = mimetype.toLowerCase();
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'avif'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext)) {
    return 'audio';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].includes(ext)) {
    return 'video';
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    mime.includes('word') ||
    mime.includes('excel') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    mime.includes('text/') ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(ext)
  ) {
    return 'document';
  }
  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('rar') ||
    mime.includes('7z') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)
  ) {
    return 'archive';
  }
  return 'other';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function sanitizeFilename(rawName: string): string {
  // Support Thai characters (\u0E00-\u0E7F), Latin, numbers, dot, dash, underscore
  const cleanName = rawName
    .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 120);
  return cleanName || `file_${Date.now()}`;
}

export interface ExtensionModuleMeta {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  badgeVariant: 'primary' | 'candy' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  defaultFolder: string;
  commonFolders: string[];
}

export const EXTENSION_MODULES: ExtensionModuleMeta[] = [
  { id: 'upload', name: 'คลังสื่อกลาง', nameEn: 'Upload Manager', icon: 'fa-solid fa-box-archive', badgeVariant: 'neutral', defaultFolder: 'general', commonFolders: ['general', 'documents', 'media'] },
  { id: 'users', name: 'ข้อมูลกำลังพล', nameEn: 'Personnel & Users', icon: 'fa-solid fa-user', badgeVariant: 'primary', defaultFolder: 'avatars', commonFolders: ['avatars', 'covers', 'rpb1', 'signatures'] },
  { id: 'news', name: 'ข่าวสารและประกาศ', nameEn: 'News & Announcements', icon: 'fa-solid fa-newspaper', badgeVariant: 'info', defaultFolder: 'posts', commonFolders: ['posts', 'banners', 'attachments'] },
  { id: 'badges', name: 'บัตรประจำตัว', nameEn: 'ID Badges', icon: 'fa-solid fa-id-card', badgeVariant: 'candy', defaultFolder: 'badges', commonFolders: ['templates', 'backgrounds', 'exports'] },
  { id: 'e-form', name: 'แบบฟอร์มและการลา', nameEn: 'e-Forms & Leaves', icon: 'fa-solid fa-file-signature', badgeVariant: 'warning', defaultFolder: 'templates', commonFolders: ['templates', 'attachments', 'signed'] },
  { id: 'site', name: 'เว็บไซต์และหน้าแรก', nameEn: 'Site & Portal', icon: 'fa-solid fa-globe', badgeVariant: 'success', defaultFolder: 'branding', commonFolders: ['logos', 'hero', 'branding'] },
  { id: 'print', name: 'เอกสารสั่งพิมพ์', nameEn: 'Print Center', icon: 'fa-solid fa-print', badgeVariant: 'danger', defaultFolder: 'exports', commonFolders: ['exports', 'templates'] },
];

export function getExtensionModuleMeta(id?: string | null): ExtensionModuleMeta {
  if (!id) return EXTENSION_MODULES[0];
  const found = EXTENSION_MODULES.find((m) => m.id === id.toLowerCase().trim());
  if (found) return found;
  return {
    id,
    name: `ส่วนขยาย ${id}`,
    nameEn: id,
    icon: 'fa-solid fa-folder',
    badgeVariant: 'neutral',
    defaultFolder: 'general',
    commonFolders: ['general'],
  };
}

export function formatThaiDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}


export function getCategoryBadgeColor(category: FileCategory): { bg: string; text: string; label: string } {
  switch (category) {
    case 'image':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', label: 'รูปภาพ' };
    case 'audio':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', label: 'ไฟล์เสียง' };
    case 'video':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', label: 'วิดีโอ' };
    case 'pdf':
      return { bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', label: 'เอกสาร PDF' };
    case 'document':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', label: 'เอกสาร' };
    case 'archive':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', label: 'ไฟล์บีบอัด' };
    default:
      return { bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', label: 'ไฟล์ทั่วไป' };
  }
}

export function getCategoryBadgeVariant(category: FileCategory): 'success' | 'candy' | 'danger' | 'info' | 'warning' | 'neutral' {
  switch (category) {
    case 'image':
      return 'success';
    case 'audio':
      return 'candy';
    case 'video':
    case 'pdf':
      return 'danger';
    case 'document':
      return 'info';
    case 'archive':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function getCategoryIcon(category: FileCategory): string {
  switch (category) {
    case 'image':
      return 'fa-solid fa-image';
    case 'audio':
      return 'fa-solid fa-music';
    case 'video':
      return 'fa-solid fa-film';
    case 'pdf':
      return 'fa-solid fa-file-pdf';
    case 'document':
      return 'fa-solid fa-file-word';
    case 'archive':
      return 'fa-solid fa-file-zipper';
    default:
      return 'fa-solid fa-file';
  }
}

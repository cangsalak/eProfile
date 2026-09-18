/**
 * Centralized Thai Date Utilities (eProfile System)
 * All year formatting defaults to Buddhist Era (พ.ศ.) using Arabic Numerals (e.g. 2569).
 */

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

export const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'] as const;
export const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'] as const;

/**
 * Converts a Gregorian year (CE) to Buddhist Era year (BE / พ.ศ.)
 */
export function toBuddhistYear(year: number): number {
  return year > 2400 ? year : year + 543;
}

/**
 * Converts a Buddhist Era year (BE / พ.ศ.) to Gregorian year (CE)
 */
export function toChristianYear(beYear: number): number {
  return beYear > 2400 ? beYear - 543 : beYear;
}

/**
 * Safely parses any date input (Date object, ISO string, 'YYYY-MM-DD', 'DD/MM/YYYY' in CE or BE)
 * into a valid Date object.
 */
export function parseDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const str = String(input).trim();
  if (!str) return null;

  // Format: DD/MM/YYYY or DD-MM-YYYY (could be CE or BE)
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year > 2400) {
      year = toChristianYear(year);
    }
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Format: YYYY-MM-DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    let year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    if (year > 2400) {
      year = toChristianYear(year);
    }
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a date into Thai Buddhist Era with full month name and Arabic numerals.
 * Example: "16 กันยายน 2569"
 */
export function formatThaiDate(
  input: string | Date | null | undefined,
  options?: {
    includeTime?: boolean;
    includeDayName?: boolean;
    fallback?: string;
  }
): string {
  const date = parseDate(input);
  if (!date) return options?.fallback ?? '-';

  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const beYear = toBuddhistYear(date.getFullYear());

  let result = `${day} ${month} ${beYear}`;

  if (options?.includeDayName) {
    const dayName = THAI_DAYS[date.getDay()];
    result = `วัน${dayName}ที่ ${result}`;
  }

  if (options?.includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    result += ` เวลา ${hours}:${minutes} น.`;
  }

  return result;
}

/**
 * Formats a date into Thai Buddhist Era with short month name and Arabic numerals.
 * Example: "16 ก.ย. 2569"
 */
export function formatShortThaiDate(
  input: string | Date | null | undefined,
  options?: {
    includeTime?: boolean;
    fallback?: string;
  }
): string {
  const date = parseDate(input);
  if (!date) return options?.fallback ?? '-';

  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const beYear = toBuddhistYear(date.getFullYear());

  let result = `${day} ${month} ${beYear}`;

  if (options?.includeTime) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    result += ` ${hours}:${minutes}`;
  }

  return result;
}

/**
 * Formats a date to standard Thai BE date string format (DD/MM/YYYY in BE).
 * Example: "16/09/2569"
 */
export function formatToThaiBEDateString(input: string | Date | null | undefined): string {
  const date = parseDate(input);
  if (!date) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const beYear = toBuddhistYear(date.getFullYear());

  return `${day}/${month}/${beYear}`;
}

/**
 * Formats a date to ISO 'YYYY-MM-DD' (standard for HTML date values / DB storage)
 */
export function formatToISODate(input: string | Date | null | undefined): string {
  const date = parseDate(input);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Converts any Thai numerals in a string to Arabic numerals.
 * Example: "๑๖ กันยายน ๒๕๖๙" -> "16 กันยายน 2569"
 */
export function thaiToArabicNumerals(str: string): string {
  if (!str) return '';
  const thaiNumerals = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.replace(/[๐-๙]/g, (ch) => String(thaiNumerals.indexOf(ch)));
}

/**
 * Converts Arabic numerals in a string or number to Thai numerals (เลขไทย).
 * Example: 18 -> "๑๘", "2569" -> "๒๕๖๙", "วันที่ 16 ตุลาคม 2569" -> "วันที่ ๑๖ ตุลาคม ๒๕๖๙"
 */
export function toThaiDigits(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.toString().replace(/[0-9]/g, (d) => thaiDigits[parseInt(d, 10)]);
}


/**
 * Convert numeric amount into Thai Baht text format
 * e.g., 43850.50 -> "สี่หมื่นสามพันแปดร้อยห้าสิบบาทห้าสิบสตางค์"
 */
export function thaiBahtText(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return 'ศูนย์บาทถ้วน';

  const THAI_DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function convertGroup(digitsStr: string): string {
    let text = '';
    const len = digitsStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(digitsStr[i], 10);
      const unitPos = len - i - 1;

      if (digit !== 0) {
        if (unitPos === 0 && digit === 1 && len > 1) {
          text += 'เอ็ด';
        } else if (unitPos === 1 && digit === 1) {
          text += '';
        } else if (unitPos === 1 && digit === 2) {
          text += 'ยี่';
        } else {
          text += THAI_DIGITS[digit];
        }
        text += THAI_UNITS[unitPos];
      }
    }
    return text;
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(2);
  const [bahtPart, satangPart] = fixed.split('.');

  let bahtText = '';
  if (parseInt(bahtPart, 10) === 0) {
    bahtText = 'ศูนย์บาท';
  } else {
    // Process in chunks of 6 digits for millions
    let remaining = bahtPart;
    let chunks: string[] = [];
    while (remaining.length > 0) {
      const chunkLen = remaining.length % 6 || 6;
      chunks.push(remaining.substring(0, chunkLen));
      remaining = remaining.substring(chunkLen);
    }

    chunks.forEach((chunk, idx) => {
      const groupText = convertGroup(chunk);
      bahtText += groupText;
      if (idx < chunks.length - 1) {
        bahtText += 'ล้าน';
      }
    });
    bahtText += 'บาท';
  }

  let satangText = '';
  const satangVal = parseInt(satangPart, 10);
  if (satangVal === 0) {
    satangText = 'ถ้วน';
  } else {
    satangText = convertGroup(satangPart) + 'สตางค์';
  }

  return (isNegative ? 'ลบ' : '') + bahtText + satangText;
}

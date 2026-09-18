import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs';
import { prisma, toThaiDigits } from '@/modules/core';

// Helper function to read file (works in Node.js environment)
const getFileBuffer = (filePath: string) => {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath));
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    return null;
  }
};

/**
 * Format Date helper into Thai string elements
 */
function getThaiDateComponents(dateInput: Date | string | null | undefined) {
  if (!dateInput) return { day: '', month: '', year: '', full: '' };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '', full: '' };

  const dayRaw = d.toLocaleDateString('th-TH', { day: 'numeric' });
  const month = d.toLocaleDateString('th-TH', { month: 'long' });
  const yearRaw = (d.getFullYear() + 543).toString();

  const day = toThaiDigits(dayRaw);
  const year = toThaiDigits(yearRaw);
  const full = `${day} ${month} ${year}`;
  return { day, month, year, full };
}

/**
 * Resolve placeholder tag values from actual leave record & personnel info
 */
function buildTagValuesMap(leaveData: any): Record<string, string> {
  const p = leaveData.personnel || {};

  const prefix = p.prefix || p.rank || '';
  const fullName = [prefix, p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || '';
  
  const start = getThaiDateComponents(leaveData.startDate);
  const end = getThaiDateComponents(leaveData.endDate);
  const created = getThaiDateComponents(leaveData.createdAt || new Date());

  const diffTime = Math.abs(new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return {
    '{{fullName}}': fullName,
    '{{rank}}': p.rank || prefix,
    '{{prefix}}': prefix,
    '{{firstName}}': p.firstName || '',
    '{{lastName}}': p.lastName || '',
    '{{position}}': p.position || '',
    '{{department}}': p.department || '',
    '{{subDepartment}}': p.subDepartment || '',
    '{{phone}}': p.phone || p.mobile || '',
    '{{citizenId}}': p.citizenId || '',

    '{{leaveType}}': leaveData.leaveType || 'การลา',
    '{{reason}}': leaveData.reason || '',
    '{{startDate}}': start.full,
    '{{startDay}}': start.day,
    '{{startMonth}}': start.month,
    '{{startYear}}': start.year,

    '{{endDate}}': end.full,
    '{{endDay}}': end.day,
    '{{endMonth}}': end.month,
    '{{endYear}}': end.year,

    '{{totalDays}}': isNaN(diffDays) ? '' : toThaiDigits(diffDays),
    '{{writtenAt}}': leaveData.writtenAt || p.department || '',
    '{{toPerson}}': leaveData.toPerson || 'ผู้บังคับบัญชา',
    '{{substitutePerson}}': leaveData.substitutePerson || '',
    '{{contactAddress}}': [
      leaveData.contactAddress,
      leaveData.contactTambon,
      leaveData.contactAmphoe,
      leaveData.contactProvince
    ].filter(Boolean).join(' ') || p.currentAddress || '',

    '{{todayFull}}': created.full,
    '{{todayDay}}': created.day,
    '{{todayMonth}}': created.month,
    '{{todayYear}}': created.year,

    '{{accumulatedLeaveDays}}': leaveData.accumulatedLeaveDays != null ? toThaiDigits(leaveData.accumulatedLeaveDays) : '',
    '{{thisYearLeaveDays}}': leaveData.thisYearLeaveDays != null ? toThaiDigits(leaveData.thisYearLeaveDays) : '',
    '{{totalAvailableDays}}': leaveData.totalLeaveDays != null ? toThaiDigits(leaveData.totalLeaveDays) : '',
    '{{pastPersonalDays}}': '',
    '{{pastSickDays}}': '',
  };
}

export async function generateLeavePDF(leaveData: any, templateCode: string): Promise<Uint8Array> {
  try {
    let template = await prisma.documentTemplate.findFirst({
      where: {
        isActive: true,
        OR: [
          { code: templateCode },
          { code: leaveData?.leaveType },
          { name: leaveData?.leaveType },
          { name: { contains: leaveData?.leaveType || '' } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!template) {
      template = await prisma.documentTemplate.findFirst({
        where: {
          isActive: true,
          category: {
            code: { in: ['leaves', 'LEAVES'] },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }
    
    let templateBuffer: Buffer | null = null;
    
    if (template && template.pdfUrl) {
      // 1. Try reading directly from local filesystem
      if (template.pdfUrl.startsWith('/')) {
        const localPath = path.join(process.cwd(), 'public', template.pdfUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          templateBuffer = fs.readFileSync(localPath);
        }
      }
      // 2. If remote URL, try fetch
      if (!templateBuffer && template.pdfUrl.startsWith('http')) {
        try {
          const res = await fetch(template.pdfUrl);
          if (res.ok) {
            templateBuffer = Buffer.from(await res.arrayBuffer());
          }
        } catch (e) {
          console.warn('Failed to fetch remote template, falling back to local', e);
        }
      }
    }

    if (!templateBuffer) {
      // Fallback local if DB doesn't have it
      const fallbackId = templateCode.split('_')[1] || '3';
      templateBuffer = getFileBuffer(`public/templates/pdf/leave_form_${fallbackId}.pdf`);
    }

    let pdfDoc: PDFDocument;
    if (templateBuffer) {
      pdfDoc = await PDFDocument.load(templateBuffer);
    } else {
      // Fallback if template doesn't exist (for testing)
      pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595.28, 841.89]); // Standard A4 size
    }

    // 2. Register fontkit to support custom fonts
    pdfDoc.registerFontkit(fontkit);

    // 3. Load TH Sarabun New font
    const fontBuffer = getFileBuffer('public/fonts/THSarabunNew.ttf');
    let customFont: any;
    if (fontBuffer) {
      customFont = await pdfDoc.embedFont(fontBuffer);
    } else {
      customFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
    }

    // 4. Check if we have Visual Canvas Tag Mappings
    let mappingConfig: any = null;
    if (template?.mappingJson) {
      try {
        mappingConfig = JSON.parse(template.mappingJson);
      } catch (err) {
        console.warn('Invalid mappingJson on template', err);
      }
    }

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const pageHeight = firstPage.getHeight(); // Standard A4: 841.89

    const tagValues = buildTagValuesMap(leaveData);

    if (mappingConfig && Array.isArray(mappingConfig.elements) && mappingConfig.elements.length > 0) {
      // ══════════════════════════════════════════════════════════════
      // DYNAMIC VISUAL CANVAS TAG PLACEMENT ACROSS ALL PAGES
      // In PDF-lib, Y=0 is BOTTOM. On Canvas Screen, Y=0 is TOP.
      // Translation formula: pdfY = targetPageHeight - canvasY - (fontSize * 0.95)
      // ══════════════════════════════════════════════════════════════
      for (const el of mappingConfig.elements) {
        const textToDraw = el.isCustom 
          ? (el.customValue || '') 
          : (el.customValue || (tagValues[el.tag] ?? el.tag));
        if (!textToDraw) continue;

        const targetPageIndex = (el.page && el.page > 0) ? el.page - 1 : 0;
        const targetPage = pages[targetPageIndex] || firstPage;
        const targetPageHeight = targetPage.getHeight();

        const fontSize = el.fontSize || 14;
        const boxHeight = el.height || 26;
        const boxWidth = el.width || 0;
        const textStr = textToDraw.toString();

        // 1. Precise baseline matching HTML flex items-center inside boxHeight
        // On HTML canvas, text is centered in boxHeight. Sarabun font baseline is at center + (fontSize * 0.35)
        // In PDF coordinates (0 is bottom of page):
        const pdfY = targetPageHeight - el.y - (boxHeight * 0.5) - (fontSize * 0.35);

        // 2. Precise horizontal alignment matching HTML text-align & px-1
        let textWidth = 0;
        try {
          textWidth = customFont.widthOfTextAtSize(textStr, fontSize);
        } catch {
          textWidth = 0;
        }

        let pdfX = el.x;
        if (el.textAlign === 'center' && boxWidth > textWidth) {
          pdfX = el.x + (boxWidth - textWidth) / 2;
        } else if (el.textAlign === 'right' && boxWidth > textWidth) {
          pdfX = el.x + boxWidth - textWidth - 2;
        } else {
          // Left aligned: account for px-1 padding on canvas (approx 2pt)
          pdfX = el.x + 2;
        }

        targetPage.drawText(textStr, {
          x: pdfX,
          y: pdfY,
          size: fontSize,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      }
    } else {
      // ══════════════════════════════════════════════════════════════
      // FALLBACK HARDCODED MAPPING (When no canvas mapping exists)
      // ══════════════════════════════════════════════════════════════
      const drawText = (text: string, x: number, y: number, size = 14) => {
        if (!text) return;
        firstPage.drawText(text, {
          x,
          y,
          size,
          font: customFont,
          color: rgb(0, 0, 0),
        });
      };

      // Header section
      drawText(tagValues['{{writtenAt}}'] || '', 400, 750);
      
      // Date
      drawText(tagValues['{{todayDay}}'] || '', 380, 730);
      drawText(tagValues['{{todayMonth}}'] || '', 420, 730);
      drawText(tagValues['{{todayYear}}'] || '', 480, 730);

      // Title / To
      drawText(`เรื่อง ขอ${leaveData.leaveType || 'ลาพักผ่อน'}`, 100, 700);
      drawText(`เรียน ${tagValues['{{toPerson}}']}`, 100, 680);

      // Name
      drawText(tagValues['{{fullName}}'] || '', 200, 650);
    }

    // 5. Serialize PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF document');
  }
}

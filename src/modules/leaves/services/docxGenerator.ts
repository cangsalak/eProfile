import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/modules/core';

// Helper function to read file
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

  const day = d.toLocaleDateString('th-TH', { day: 'numeric' });
  const month = d.toLocaleDateString('th-TH', { month: 'long' });
  const year = (d.getFullYear() + 543).toString();
  const full = `${day} ${month} ${year}`;
  return { day, month, year, full };
}

export async function generateLeaveDocx(leaveData: any, templateCode: string): Promise<Buffer> {
  try {
    const template = await prisma.documentTemplate.findFirst({
      where: { code: templateCode, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    let content: Buffer | null = null;
    
    if (template && template.docxUrl) {
      try {
        const url = template.docxUrl.startsWith('http') ? template.docxUrl : `http://localhost:3000${template.docxUrl}`;
        const res = await fetch(url);
        if (res.ok) {
          content = Buffer.from(await res.arrayBuffer());
        }
      } catch (e) {
        console.warn('Failed to fetch remote template, falling back to local', e);
      }
    }

    if (!content) {
      const fallbackId = templateCode.split('_')[1] || '3';
      content = getFileBuffer(`public/templates/docx/leave_form_${fallbackId}.docx`);
    }

    if (!content) {
      throw new Error(`Template file not found for docx code ${templateCode}`);
    }

    // 2. Unzip the content of the file
    const zip = new PizZip(content);

    // 3. Initialize docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 4. Build comprehensive template variables matching all detected and standard tags
    const p = leaveData.personnel || {};
    const prefix = p.prefix || p.rank || '';
    const fullName = [prefix, p.firstName, p.lastName].filter(Boolean).join(' ') || p.name || '';
    
    const start = getThaiDateComponents(leaveData.startDate);
    const end = getThaiDateComponents(leaveData.endDate);
    const created = getThaiDateComponents(leaveData.createdAt || new Date());

    const diffTime = Math.abs(new Date(leaveData.endDate).getTime() - new Date(leaveData.startDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Provide both clean names and exact tag patterns
    const renderData: Record<string, any> = {
      // Personnel Data
      fullName,
      name: fullName,
      rank: p.rank || prefix,
      prefix,
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      position: p.position || '',
      department: leaveData.department || p.department || '',
      subDepartment: p.subDepartment || '',
      phone: p.phone || p.mobile || '',
      citizenId: p.citizenId || '',

      // Leave Info
      leaveType: leaveData.leaveType || 'การลา',
      reason: leaveData.reason || '',
      startDate: start.full,
      startDay: start.day,
      startMonth: start.month,
      startYear: start.year,

      endDate: end.full,
      endDay: end.day,
      endMonth: end.month,
      endYear: end.year,

      totalDays: isNaN(diffDays) ? '' : diffDays,
      diffDays: isNaN(diffDays) ? '' : diffDays,
      writtenAt: leaveData.writtenAt || p.department || '',
      toPerson: leaveData.toPerson || 'ผู้บังคับบัญชา',
      commanderName: leaveData.toPerson || leaveData.commanderName || 'ผู้บังคับบัญชา',
      substitutePerson: leaveData.substitutePerson || '',
      contactAddress: [
        leaveData.contactAddress,
        leaveData.contactTambon,
        leaveData.contactAmphoe,
        leaveData.contactProvince
      ].filter(Boolean).join(' ') || p.currentAddress || '',

      // Dates
      dateDay: created.day,
      dateMonth: created.month,
      dateYear: created.year,
      todayFull: created.full,
      todayDay: created.day,
      todayMonth: created.month,
      todayYear: created.year,

      // Stats
      accumulatedLeaveDays: leaveData.accumulatedLeaveDays ?? '',
      thisYearLeaveDays: leaveData.thisYearLeaveDays ?? '',
      totalAvailableDays: leaveData.totalLeaveDays ?? '',
    };

    // Inject custom values or static overrides from canvas mapping
    if (template?.mappingJson) {
      try {
        const mapping = JSON.parse(template.mappingJson);
        if (Array.isArray(mapping.elements)) {
          for (const el of mapping.elements) {
            if (el.customValue) {
              const cleanTag = el.tag.replace(/[\{\}]/g, '').trim();
              renderData[cleanTag] = el.customValue;
              renderData[el.tag] = el.customValue;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse mappingJson for docx', e);
      }
    }

    doc.render(renderData);

    // 5. Get the zip document and generate it as a nodebuffer
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    return buf;
    
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
}

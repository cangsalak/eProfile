import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { verifyAuth } from '@/modules/core';
import { isValidId } from '@/modules/core';
import { generateLeavePDF } from '../services/pdfGenerator';
import { generateLeaveDocx } from '../services/docxGenerator';

/**
 * Map leave types to specific template ID.
 * - แบบ ๓: ลาพักผ่อน ('3')
 * - แบบ ๔: ลาป่วย ('4')
 * - แบบ ๕: ลากิจ ('5')
 * - แบบ ๖: ลาคลอดบุตร ('6')
 * - แบบ ๗: ลาอุปสมบท ('7')
 */
function getTemplateCode(leaveType: string | null): string {
  if (!leaveType) return 'LEAVE_3';
  if (leaveType.includes('ป่วย')) return 'LEAVE_4';
  if (leaveType.includes('กิจ') || leaveType.includes('ช่วยราชการ')) return 'LEAVE_5';
  if (leaveType.includes('คลอด')) return 'LEAVE_6';
  if (leaveType.includes('อุปสมบท') || leaveType.includes('บวช')) return 'LEAVE_7';
  
  // Default to form 3 (ลาพักผ่อน)
  return 'LEAVE_3';
}

export async function handleGeneratePDF(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leave = await prisma.leaveRecord.findUnique({
      where: { id: params.id },
      include: {
        personnel: true,
      },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    const templateCode = getTemplateCode(leave.leaveType); 

    const pdfBytes = await generateLeavePDF(leave, templateCode);

    // Return as PDF file
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="leave_${leave.id}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: error.message || 'Error generating PDF' }, { status: 500 });
  }
}

export async function handleGenerateDocx(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leave = await prisma.leaveRecord.findUnique({
      where: { id: params.id },
      include: {
        personnel: true,
      },
    });

    if (!leave) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    const templateCode = getTemplateCode(leave.leaveType); 

    const docxBytes = await generateLeaveDocx(leave, templateCode);

    return new NextResponse(docxBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="leave_${leave.id}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({ error: error.message || 'Error generating DOCX' }, { status: 500 });
  }
}

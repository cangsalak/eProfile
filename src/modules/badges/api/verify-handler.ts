import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { isValidId } from '@/modules/core';

/**
 * Public Badge Verification Handler
 * Validates and returns personnel public badge info (e.g. for QR Code scanning)
 */
export async function handleVerifyPersonnel(
  request: Request,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const id = (context.params.id as string) || '';
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: 'รูปแบบ ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const person = await prisma.personnel.findUnique({
      where: { id },
      select: {
        id: true,
        badgeNo: true,
        prefix: true,
        firstName: true,
        lastName: true,
        position: true,
        department: true,
        subDepartment: true,
        personnelType: true,
        status: true,
        avatarColor: true,
        coverPhoto: true,
      },
    });

    if (!person) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลบุคลากรในระบบ' }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error('[Badge Verify Error]:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูลบัตร' }, { status: 500 });
  }
}

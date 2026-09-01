import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidId } from '@/lib/validate-utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const person = await prisma.personnel.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error verifying personnel:', error);
    return NextResponse.json({ error: 'Failed to verify personnel' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError) return authError;

    const { id } = params;
    const body = await req.json();

    const contactMsg = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: body.status
      }
    });

    return NextResponse.json(contactMsg);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError) return authError;

    const { id } = params;

    await prisma.contactMessage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete contact' }, { status: 500 });
  }
}

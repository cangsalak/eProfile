import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    await prisma.mediaFile.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

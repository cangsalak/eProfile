import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;
    const body = await req.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.published !== undefined && { published: body.published })
      }
    });

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'UPDATE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title })
      }
    }).catch(() => {});

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const post = await prisma.post.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'DELETE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title })
      }
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
  }
}

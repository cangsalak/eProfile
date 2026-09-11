import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function handleUpdatePost(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: 'รหัสข่าวสารไม่ถูกต้อง' }, { status: 400 });
    }

    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้มีสิทธิ์จัดการข่าวสารเท่านั้น' }, { status: 401 });
    }

    const body = await req.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.published !== undefined && { published: body.published }),
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarColor: true, role: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'UPDATE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title, category: post.category }),
      },
    }).catch(() => {});

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการแก้ไขข่าวสาร' }, { status: 500 });
  }
}

export async function handleDeletePost(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: 'รหัสข่าวสารไม่ถูกต้อง' }, { status: 400 });
    }

    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้มีสิทธิ์จัดการข่าวสารเท่านั้น' }, { status: 401 });
    }

    const post = await prisma.post.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'DELETE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: `ลบข่าวสาร "${post.title}" เรียบร้อยแล้ว` });
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการลบข่าวสาร' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma, verifyAuth, isValidId } from '@/modules/core';

export async function handleGetComments(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const postId = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!postId || !isValidId(postId)) {
      return NextResponse.json({ error: 'รหัสข่าวสารไม่ถูกต้อง' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('Failed to get comments:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถโหลดความคิดเห็นได้' }, { status: 500 });
  }
}

export async function handleCreateComment(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const postId = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!postId || !isValidId(postId)) {
      return NextResponse.json({ error: 'รหัสข่าวสารไม่ถูกต้อง' }, { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'ไม่พบข่าวสารที่ระบุ' }, { status: 404 });
    }

    const body = await req.json();
    const content = (body.content || '').trim();

    if (!content) {
      return NextResponse.json({ error: 'กรุณากรอกข้อความแสดงความคิดเห็น' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'ข้อความความคิดเห็นยาวเกินไป (ไม่เกิน 2,000 ตัวอักษร)' }, { status: 400 });
    }

    const user = await verifyAuth(req);

    let authorId: string | null = null;
    let authorName = 'ผู้เยี่ยมชม';
    let authorAvatar: string | null = null;

    if (user) {
      authorId = user.id;
      const personnel = await prisma.personnel.findUnique({
        where: { id: user.id },
        select: { firstName: true, lastName: true, avatarColor: true },
      });
      if (personnel) {
        authorName = `${personnel.firstName} ${personnel.lastName}`.trim();
        authorAvatar = personnel.avatarColor;
      } else {
        authorName = user.username || 'บุคลากร';
      }
    } else {
      if (body.authorName && body.authorName.trim()) {
        authorName = body.authorName.trim().substring(0, 80);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId,
        authorName,
        authorAvatar,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarColor: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create comment:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถส่งความคิดเห็นได้' }, { status: 500 });
  }
}

export async function handleDeleteComment(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string; commentId?: string } }
) {
  try {
    const rawParams = (context?.params || {}) as Record<string, string>;
    const commentId = rawParams.commentId || rawParams.id;

    if (!commentId || !isValidId(commentId)) {
      return NextResponse.json({ error: 'รหัสความคิดเห็นไม่ถูกต้อง' }, { status: 400 });
    }

    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'กรุณาเข้าสู่ระบบก่อนดำเนินการ' }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'ไม่พบความคิดเห็นนี้' }, { status: 404 });
    }

    const isOwner = comment.authorId === user.id;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ลบความคิดเห็นนี้' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true, message: 'ลบความคิดเห็นเรียบร้อยแล้ว' });
  } catch (error: any) {
    console.error('Failed to delete comment:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถลบความคิดเห็นได้' }, { status: 500 });
  }
}

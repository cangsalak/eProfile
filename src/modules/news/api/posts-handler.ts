import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export async function handleGetPosts(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const category = searchParams.get('category');
    const query = searchParams.get('q') || '';

    const where: any = {};
    if (publishedOnly) {
      where.published = true;
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    if (query.trim()) {
      where.OR = [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { content: { contains: query.trim(), mode: 'insensitive' } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarColor: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: error.message || 'ไม่สามารถดึงข้อมูลข่าวสารได้' }, { status: 500 });
  }
}

export async function handleCreatePost(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้มีสิทธิ์จัดการข่าวสารเท่านั้น' }, { status: 401 });
    }

    const { title, content, category, image, published } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'กรุณากรอกหัวข้อและเนื้อหาข่าวสาร' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category: category || 'ข่าวทั่วไป',
        image: image || null,
        published: published ?? true,
        authorId: user.id,
      },
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarColor: true, role: true },
        },
      },
    });

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // Audit log
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'CREATE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title, category: post.category }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการสร้างข่าวสาร' }, { status: 500 });
  }
}

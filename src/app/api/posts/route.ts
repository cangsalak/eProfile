import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get('published') === 'true';

    const posts = await prisma.post.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarColor: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, content, category, image, published } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category: category || 'ข่าวทั่วไป',
        image: image || null,
        published: published ?? true,
        authorId: user.id
      }
    });

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // Audit log
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'CREATE',
        entity: 'Post',
        entityId: post.id,
        details: JSON.stringify({ title: post.title }),
        ipAddress: clientIp,
      }
    }).catch(() => {});

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}

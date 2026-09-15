import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requireAuth } from '@/modules/core';
import { getFileCategory } from '../lib/file-utils';

export async function handleListMedia(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('q') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '30', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.trim()) {
      where.filename = {
        contains: query.trim(),
        mode: 'insensitive',
      };
    }

    if (category === 'image') {
      where.mimetype = { startsWith: 'image/' };
    } else if (category === 'audio') {
      where.mimetype = { startsWith: 'audio/' };
    } else if (category === 'video') {
      where.mimetype = { startsWith: 'video/' };
    } else if (category === 'pdf') {
      where.OR = [
        { mimetype: 'application/pdf' },
        { filename: { endsWith: '.pdf', mode: 'insensitive' } },
      ];
    } else if (category === 'document') {
      where.OR = [
        { mimetype: { contains: 'word' } },
        { mimetype: { contains: 'excel' } },
        { mimetype: { contains: 'spreadsheet' } },
        { mimetype: { contains: 'presentation' } },
        { mimetype: { contains: 'text/' } },
        { filename: { endsWith: '.docx', mode: 'insensitive' } },
        { filename: { endsWith: '.xlsx', mode: 'insensitive' } },
        { filename: { endsWith: '.pptx', mode: 'insensitive' } },
        { filename: { endsWith: '.txt', mode: 'insensitive' } },
        { filename: { endsWith: '.csv', mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.mediaFile.count({ where }),
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          uploadedBy: {
            select: { firstName: true, lastName: true, role: true },
          },
        },
      }),
    ]);

    // Format items with detected category
    const formatted = items.map((item) => ({
      ...item,
      category: getFileCategory(item.mimetype, item.filename),
    }));

    return NextResponse.json({
      items: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Failed to list media files:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการดึงรายการไฟล์' },
      { status: 500 }
    );
  }
}

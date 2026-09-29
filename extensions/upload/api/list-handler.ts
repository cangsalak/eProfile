import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requireAuth } from '@/modules/core';
import { getFileCategory } from '../lib/file-utils';
import { getStorageConfig } from '../lib/s3-client';

export async function handleListMedia(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const moduleFilter = searchParams.get('module') || searchParams.get('extension') || 'all';
    const folderFilter = searchParams.get('folder') || 'all';
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '30', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.trim()) {
      where.filename = {
        contains: query.trim(),
      };
    }

    if (moduleFilter !== 'all') {
      where.module = moduleFilter;
    }

    if (folderFilter !== 'all') {
      where.folder = folderFilter;
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
        { filename: { endsWith: '.pdf' } },
        { filename: { endsWith: '.PDF' } },
      ];
    } else if (category === 'document') {
      where.OR = [
        { mimetype: { contains: 'word' } },
        { mimetype: { contains: 'excel' } },
        { mimetype: { contains: 'spreadsheet' } },
        { mimetype: { contains: 'presentation' } },
        { mimetype: { contains: 'text/' } },
        { filename: { endsWith: '.docx' } },
        { filename: { endsWith: '.DOCX' } },
        { filename: { endsWith: '.xlsx' } },
        { filename: { endsWith: '.XLSX' } },
        { filename: { endsWith: '.pptx' } },
        { filename: { endsWith: '.PPTX' } },
        { filename: { endsWith: '.txt' } },
        { filename: { endsWith: '.TXT' } },
        { filename: { endsWith: '.csv' } },
        { filename: { endsWith: '.CSV' } },
      ];
    }

    // Build sort clause (default: createdAt desc)
    const orderBy: any = {};
    if (sortBy === 'filename' || sortBy === 'size' || sortBy === 'createdAt') {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    const [total, items, allMediaForStats, storageConfig] = await Promise.all([
      prisma.mediaFile.count({ where }),
      prisma.mediaFile.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          uploadedBy: {
            select: { firstName: true, lastName: true, role: true },
          },
        },
      }),
      prisma.mediaFile.findMany({
        select: { size: true, mimetype: true, filename: true, module: true, folder: true, url: true },
      }),
      getStorageConfig(),
    ]);

    let totalBytes = 0;
    let imageCount = 0;
    let audioCount = 0;
    let videoCount = 0;
    let pdfCount = 0;
    let docCount = 0;
    const moduleCounts: Record<string, number> = {};

    for (const f of allMediaForStats) {
      totalBytes += f.size || 0;
      const cat = getFileCategory(f.mimetype, f.filename);
      if (cat === 'image') imageCount++;
      else if (cat === 'audio') audioCount++;
      else if (cat === 'video') videoCount++;
      else if (cat === 'pdf') pdfCount++;
      else if (cat === 'document') docCount++;

      // Detect module from record or URL fallback
      let mod = f.module;
      if (!mod) {
        const match = f.url?.match(/\/uploads\/([a-zA-Z0-9_-]+)\//);
        mod = match ? match[1] : 'upload';
      }
      moduleCounts[mod] = (moduleCounts[mod] || 0) + 1;
    }

    const stats = {
      totalFiles: allMediaForStats.length,
      totalBytes,
      imageCount,
      audioCount,
      videoCount,
      pdfCount,
      docCount,
      moduleCounts,
      provider: storageConfig.provider,
    };

    // Format items with detected category and module
    const formatted = items.map((item) => {
      let mod = item.module;
      if (!mod) {
        const match = item.url?.match(/\/uploads\/([a-zA-Z0-9_-]+)\//);
        mod = match ? match[1] : 'upload';
      }
      return {
        ...item,
        module: mod,
        folder: item.folder || 'general',
        category: getFileCategory(item.mimetype, item.filename),
      };
    });

    return NextResponse.json({
      items: formatted,
      stats,
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

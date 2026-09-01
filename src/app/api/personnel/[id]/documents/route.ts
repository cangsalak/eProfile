import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';
import { isValidId, isSafeFilename, isAllowedMimeType } from '@/lib/validate-utils';
import { logSecurityEvent } from '@/lib/logger';

const ALLOWED_CATEGORIES = [
  'คำสั่ง',
  'บัตรประจำตัว',
  'วุฒิการศึกษา',
  'ใบประกาศ',
  'ทะเบียนประวัติ',
  'อื่นๆ'
];

// GET /api/personnel/[id]/documents - List documents for a personnel
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid personnel ID format' }, { status: 400 });
    }

    const { error: authError, user: authUser } = await requireAuth(req);
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isOwn = authUser.id === params.id;
    const isElevated = authUser.role === 'ADMIN' || authUser.role === 'SUPER_ADMIN';

    if (!isOwn && !isElevated) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const documents = await prisma.personnelDocument.findMany({
      where: { personnelId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch personnel documents' },
      { status: 500 }
    );
  }
}

// POST /api/personnel/[id]/documents - Add document metadata
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid personnel ID format' }, { status: 400 });
    }

    const { error: authError, user: authUser } = await requireAuth(req);
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isOwn = authUser.id === params.id;
    const isElevated = authUser.role === 'ADMIN' || authUser.role === 'SUPER_ADMIN';

    if (!isOwn && !isElevated) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const { category, filename, mimeType, size, storagePath, notes, expiresAt } = body;

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!filename || !isSafeFilename(filename)) {
      return NextResponse.json({ error: 'Invalid or unsafe filename' }, { status: 400 });
    }

    if (!mimeType || !isAllowedMimeType(mimeType)) {
      return NextResponse.json({ error: 'Disallowed file type' }, { status: 400 });
    }

    if (typeof size !== 'number' || size <= 0 || size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be between 1 byte and 10MB' }, { status: 400 });
    }

    if (!storagePath || typeof storagePath !== 'string' || storagePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid storage path' }, { status: 400 });
    }

    const document = await prisma.personnelDocument.create({
      data: {
        personnelId: params.id,
        category,
        filename,
        mimeType,
        size,
        storagePath,
        uploadedBy: authUser.id,
        notes: notes ? String(notes) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await logSecurityEvent({
      action: 'DOCUMENT_UPLOADED',
      userId: authUser.id,
      endpoint: `/api/personnel/${params.id}/documents`,
      details: {
        documentId: document.id,
        category: document.category,
        filename: document.filename,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}

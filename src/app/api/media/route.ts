import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { validateUploadedFile } from '@/lib/validate-utils';

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const files = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json(files);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { filename, url, size, mimetype } = body || {};

    if (!filename || typeof filename !== 'string' || !size || typeof size !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid file metadata' }, { status: 400 });
    }

    // Security: Validate File metadata using shared utility
    const fileValidation = validateUploadedFile({ name: filename, size, type: mimetype || '' });
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const file = await prisma.mediaFile.create({
      data: {
        filename,
        url,
        size,
        mimetype,
        uploadedById: user.id
      }
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

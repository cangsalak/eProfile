import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';
import { uploadToStorage } from '../lib/storage-provider';
import { validateUploadedFile } from '@/modules/core';

export async function handleUploadMedia(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_MEDIA');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: ไม่มีสิทธิ์จัดการไฟล์สื่อ (MANAGE_MEDIA required)' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';

    // 1. Handle Multipart / FormData (Real Binary File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const files: File[] = [];

      // Collect all files from formData
      for (const [key, value] of Array.from(formData.entries())) {
        if (value instanceof File && (key === 'file' || key === 'files' || key.startsWith('file_'))) {
          files.push(value);
        }
      }

      if (files.length === 0) {
        return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
      }

      const results = [];

      for (const file of files) {
        const fileValidation = validateUploadedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        });
        if (!fileValidation.valid) {
          return NextResponse.json({ error: fileValidation.error || 'ไฟล์ไม่ถูกต้อง' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const mimetype = file.type || 'application/octet-stream';

        // Storage upload (S3 or Local)
        const uploadResult = await uploadToStorage(buffer, file.name, mimetype);

        // Save record to DB
        const record = await prisma.mediaFile.create({
          data: {
            filename: file.name,
            url: uploadResult.url,
            size: uploadResult.size,
            mimetype,
            uploadedById: user.id,
          },
          include: {
            uploadedBy: {
              select: { firstName: true, lastName: true, role: true },
            },
          },
        });

        results.push(record);
      }

      // If single file upload, return both file object and list
      return NextResponse.json(
        results.length === 1
          ? { success: true, file: results[0], files: results }
          : { success: true, files: results, count: results.length },
        { status: 201 }
      );
    }

    // 2. Handle JSON payload (legacy metadata upload)
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const { filename, url, size, mimetype } = body || {};
    if (!filename || typeof filename !== 'string' || !url || typeof url !== 'string') {
      return NextResponse.json({ error: 'ข้อมูลไฟล์ไม่ครบถ้วน' }, { status: 400 });
    }

    const fileValidation = validateUploadedFile({
      name: filename,
      size: Number(size) || 0,
      type: mimetype || 'application/octet-stream',
    });
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error || 'ไฟล์ไม่ถูกต้อง' }, { status: 400 });
    }

    const record = await prisma.mediaFile.create({
      data: {
        filename,
        url,
        size: Number(size) || 0,
        mimetype: mimetype || 'application/octet-stream',
        uploadedById: user.id,
      },
      include: {
        uploadedBy: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, file: record, files: [record] }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to handle media upload:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  }
}

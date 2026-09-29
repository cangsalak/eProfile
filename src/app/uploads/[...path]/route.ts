import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain; charset=utf-8',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const segments = params.path;
    if (!segments || segments.length === 0) {
      return new NextResponse('File not specified', { status: 400 });
    }

    // Sanitize segments to prevent directory traversal
    for (const seg of segments) {
      if (seg.includes('..') || seg.includes('/') || seg.includes('\\')) {
        return new NextResponse('Invalid path', { status: 400 });
      }
    }

    // Try resolving in public/uploads/... first
    const primaryDir = path.resolve(process.cwd(), 'public', 'uploads');
    let targetPath = path.join(primaryDir, ...segments);

    if (!targetPath.startsWith(primaryDir) || !fs.existsSync(targetPath)) {
      // Fallback: check project root uploads/...
      const fallbackDir = path.resolve(process.cwd(), 'uploads');
      const fallbackPath = path.join(fallbackDir, ...segments);
      if (fallbackPath.startsWith(fallbackDir) && fs.existsSync(fallbackPath)) {
        targetPath = fallbackPath;
      } else {
        return new NextResponse('File not found', { status: 404 });
      }
    }

    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 400 });
    }

    const ext = path.extname(targetPath).toLowerCase().replace(/^\./, '');
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    const fileBuffer = fs.readFileSync(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

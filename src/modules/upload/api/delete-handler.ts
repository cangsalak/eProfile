import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { deleteFromStorage } from '../lib/storage-provider';

export async function handleDeleteMedia(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_MEDIA');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้มีสิทธิ์จัดการสื่อเท่านั้น' }, { status: 401 });
    }

    const id = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสไฟล์' }, { status: 400 });
    }

    const file = await prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการลบ' }, { status: 404 });
    }

    // 1. Delete physical object from S3 or Local Disk
    await deleteFromStorage(file.url);

    // 2. Delete DB record
    await prisma.mediaFile.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `ลบไฟล์ "${file.filename}" เรียบร้อยแล้ว`,
    });
  } catch (error: any) {
    console.error('Failed to delete media file:', error);
    return NextResponse.json(
      { error: error.message || 'เกิดข้อผิดพลาดในการลบไฟล์' },
      { status: 500 }
    );
  }
}

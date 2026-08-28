import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }

    if (!file.name.endsWith('.db')) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์ฐานข้อมูล .db เท่านั้น' }, { status: 400 });
    }

    // 1. Disconnect Prisma to release file locks
    await prisma.$disconnect();

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const walPath = path.join(process.cwd(), 'prisma', 'dev.db-wal');
    const shmPath = path.join(process.cwd(), 'prisma', 'dev.db-shm');

    // 2. Remove WAL and SHM files to prevent corruption
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    // 3. Write new file buffer to dev.db
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(dbPath, buffer);

    // 4. Try to restart the PM2 process asynchronously so that this request can finish successfully
    // We don't await this so it happens after response
    setTimeout(() => {
      execPromise('pm2 restart eprofile').catch(e => console.error('Failed to restart PM2:', e));
    }, 1000);

    return NextResponse.json({ success: true, message: 'กู้คืนฐานข้อมูลสำเร็จ ระบบกำลังเริ่มใหม่...' });
  } catch (error) {
    console.error('Restore Error:', error);
    // Attempt to reconnect if failed
    prisma.$connect().catch(console.error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการกู้คืนฐานข้อมูล' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import util from 'util';
import { requireRole } from '@/lib/auth-guards';

const execPromise = util.promisify(exec);

export const dynamic = 'force-dynamic';

// Validate that buffer is a valid SQLite file
function isSQLiteFile(buffer: Buffer): boolean {
  // SQLite magic number: first 16 bytes must start with "SQLite format 3\0"
  const magic = 'SQLite format 3\0';
  if (buffer.length < 16) return false;
  const header = buffer.slice(0, 16).toString('binary');
  return header === magic;
}

export async function POST(request: Request) {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const safetyBackupPath = path.join(process.cwd(), 'prisma', `dev.db.safety_backup_${Date.now()}`);

  try {
    const { error, user } = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }

    // 1. Validate extension
    if (!file.name.endsWith('.db')) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์ฐานข้อมูล .db เท่านั้น' }, { status: 400 });
    }

    // 2. Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 500MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Validate SQLite magic bytes
    if (!isSQLiteFile(buffer)) {
      return NextResponse.json({ error: 'ไฟล์ที่อัปโหลดไม่ใช่ฐานข้อมูล SQLite ที่ถูกต้อง' }, { status: 400 });
    }

    // 3b. Schema version check: read user_version pragma from backup
    // SQLite stores user_version at bytes 60-63 (big-endian uint32)
    const backupUserVersion = buffer.readUInt32BE(60);
    const warnVersionMismatch = backupUserVersion === 0
      ? false // no version set, skip check
      : false; // For now: log only, don't block restore (schema may differ across envs)
    
    if (backupUserVersion > 0) {
      console.log(`[Restore] Backup SQLite user_version: ${backupUserVersion}`);
    }

    // 4. Create safety backup of current DB before overwriting
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, safetyBackupPath);
    }

    // 5. Disconnect Prisma to release file locks
    await prisma.$disconnect();

    const walPath = path.join(process.cwd(), 'prisma', 'dev.db-wal');
    const shmPath = path.join(process.cwd(), 'prisma', 'dev.db-shm');

    // 6. Remove WAL and SHM files to prevent corruption
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    // 7. Atomic write: write to temp file then rename (atomic replacement)
    const tmpPath = dbPath + '.tmp';
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, dbPath);

    // 8. Clean up safety backup after successful restore
    if (fs.existsSync(safetyBackupPath)) {
      fs.unlinkSync(safetyBackupPath);
    }

    // 9. Audit log BACKUP_RESTORED (reconnect first)
    await prisma.$connect();
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'BACKUP_RESTORED',
        entity: 'Database',
        entityId: 'dev.db',
        details: `Database restored from file: ${file.name} by ${user.role}`,
      },
    }).catch(() => {/* non-blocking */});

    // 10. Restart PM2 process asynchronously
    setTimeout(() => {
      execPromise('pm2 restart eprofile').catch(e => console.error('Failed to restart PM2:', e));
    }, 1000);

    return NextResponse.json({ success: true, message: 'กู้คืนฐานข้อมูลสำเร็จ ระบบกำลังเริ่มใหม่...' });
  } catch (error) {
    console.error('Restore Error:', error);

    // Attempt to rollback to safety backup
    if (fs.existsSync(safetyBackupPath)) {
      try {
        fs.copyFileSync(safetyBackupPath, dbPath);
        fs.unlinkSync(safetyBackupPath);
        console.log('Rolled back to safety backup successfully');
      } catch (rollbackErr) {
        console.error('Rollback failed:', rollbackErr);
      }
    }

    // Attempt to reconnect if failed
    prisma.$connect().catch(console.error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการกู้คืนฐานข้อมูล' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const BACKUP_DIR = path.join(process.cwd(), 'prisma', 'backups');
const MAX_BACKUPS = 30; // Keep last 30 backups

/**
 * GET /api/backup/list — List all available local backups
 * DELETE /api/backup/list — Cleanup old backups (keep last 30)
 */
export async function GET(req: Request) {
  try {
    const { error, user } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!fs.existsSync(BACKUP_DIR)) {
      return NextResponse.json({ backups: [] });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const stat = fs.statSync(path.join(BACKUP_DIR, f));
        return {
          filename: f,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ backups: files, count: files.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { error, user } = await requireRole(req, ['SUPER_ADMIN']);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!fs.existsSync(BACKUP_DIR)) {
      return NextResponse.json({ message: 'No backup directory', deleted: 0 });
    }

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => ({
        name: f,
        fullPath: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    // Keep only the last MAX_BACKUPS, delete the rest
    const toDelete = files.slice(MAX_BACKUPS);
    toDelete.forEach(f => fs.unlinkSync(f.fullPath));

    return NextResponse.json({
      message: `Cleanup complete. Kept ${Math.min(files.length, MAX_BACKUPS)}, deleted ${toDelete.length}`,
      deleted: toDelete.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cleanup backups' }, { status: 500 });
  }
}

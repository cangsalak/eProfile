import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { error, user } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ error: 'Database file not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(dbPath);

    // Audit log: BACKUP_CREATED
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'BACKUP_CREATED',
        entity: 'Database',
        entityId: 'dev.db',
        details: `Backup created by ${user.role}`,
      },
    }).catch(() => {/* non-blocking */});

    const date = new Date();
    const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const filename = `eprofile_backup_${formattedDate}.db`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating backup:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}

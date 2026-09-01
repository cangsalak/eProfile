import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { APP_NAME, APP_VERSION, VERSION_LABEL } from '@/lib/version';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint for system monitoring (PM2 / Synology / Uptime Kuma).
 * Returns system health metrics safely.
 */
export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Database Connectivity & Latency Check
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    // 2. Memory Usage
    const mem = process.memoryUsage();
    const memoryMB = Math.round(mem.rss / 1024 / 1024);

    // 3. Process Uptime
    const uptimeSeconds = Math.round(process.uptime());

    // 4. Last Backup Status
    let lastBackup: string | null = null;
    const backupDir = path.join(process.cwd(), 'prisma', 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.db'));
      if (files.length > 0) {
        const sorted = files.map(f => ({
          name: f,
          time: fs.statSync(path.join(backupDir, f)).mtime
        })).sort((a, b) => b.time.getTime() - a.time.getTime());
        lastBackup = sorted[0].time.toISOString();
      }
    }

    return NextResponse.json({
      status: 'ok',
      app: APP_NAME,
      version: APP_VERSION,
      versionLabel: VERSION_LABEL,
      timestamp: new Date().toISOString(),
      db: 'connected',
      latencyMs,
      uptimeSeconds,
      memoryMB,
      lastBackup,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      app: APP_NAME,
      version: APP_VERSION,
      versionLabel: VERSION_LABEL,
      timestamp: new Date().toISOString(),
      db: 'disconnected',
    }, { status: 503 });
  }
}

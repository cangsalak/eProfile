import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const SENSITIVE_SETTING_PATTERNS = [
  /connection/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /apikey/i,
];

export async function GET(req: Request) {
  try {
    const { error, user } = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
    if (error || !user) return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const format = url.searchParams.get('format') || 'json';

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';
    const date = new Date();
    const timestampStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}`;

    // 1. Native .db file backup (for SQLite) - strictly SUPER_ADMIN only
    if (format === 'db' || format === 'sqlite') {
      if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({
          error: 'การดาวน์โหลดไฟล์ฐานข้อมูลไบนารี SQLite สงวนสิทธิ์เฉพาะผู้ดูแลระบบระดับสูง (SUPER_ADMIN) เท่านั้น'
        }, { status: 403 });
      }

      const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

      if (!fs.existsSync(dbPath)) {
        return NextResponse.json({
          error: 'ไม่พบไฟล์ฐานข้อมูล SQLite บนเครื่องเซิร์ฟเวอร์ (หากใช้ PostgreSQL หรือ MySQL ให้เลือกดาวน์โหลดแบบ Universal JSON)'
        }, { status: 404 });
      }

      const fileBuffer = fs.readFileSync(dbPath);

      // Audit log: BACKUP_CREATED
      await prisma.auditLog.create({
        data: {
          personnelId: user.id,
          action: 'BACKUP_CREATED',
          entity: 'Database',
          entityId: 'dev.db',
          details: `SQLite binary backup downloaded by ${user.role} (${user.username})`,
          ipAddress: clientIp,
        },
      }).catch(() => {/* non-blocking */});

      const filename = `eprofile_sqlite_backup_${timestampStr}.db`;

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // 2. Universal JSON Backup (Cross-Database: SQLite, PostgreSQL, MySQL)
    const [
      rawSettings,
      systemRoles,
      departments,
      rawPersonnelList,
      vehicles,
      leaveRecords,
      notifications,
      posts,
      documents,
      calendarEvents,
      contactMessages,
      auditLogs,
    ] = await Promise.all([
      prisma.systemSetting.findMany(),
      prisma.systemRole.findMany(),
      prisma.department.findMany(),
      prisma.personnel.findMany(),
      prisma.vehicle.findMany(),
      prisma.leaveRecord.findMany(),
      prisma.notification.findMany({ take: 500 }),
      prisma.post.findMany(),
      prisma.personnelDocument.findMany(),
      prisma.calendarEvent.findMany(),
      prisma.contactMessage.findMany(),
      prisma.auditLog.findMany({ take: 1000, orderBy: { createdAt: 'desc' } }),
    ]);

    // Data Privacy & Security Sanitization:
    // 1. Sanitize System Settings (Omit secrets, connection strings, tokens, and credentials)
    const sanitizedSettings = rawSettings.filter((s: { key: string }) => {
      return !SENSITIVE_SETTING_PATTERNS.some((pattern) => pattern.test(s.key));
    });

    // 2. Sanitize Personnel (Strip password hashes, sensitive lock fields)
    const sanitizedPersonnel = rawPersonnelList.map((p: any) => {
      const {
        password,
        failedLoginAttempts,
        lockedUntil,
        ...safePersonnel
      } = p;
      return safePersonnel;
    });

    // Detect DB Provider from sanitized settings or default
    const providerSetting = rawSettings.find((s: { key: string }) => s.key === 'dbProvider');
    const dbProvider = providerSetting?.value || 'sqlite';

    const backupPayload = {
      app: 'eProfile',
      version: '1.3.0',
      exportedAt: date.toISOString(),
      exportedBy: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      dbProvider,
      summary: {
        systemSettings: sanitizedSettings.length,
        systemRoles: systemRoles.length,
        departments: departments.length,
        personnel: sanitizedPersonnel.length,
        vehicles: vehicles.length,
        leaveRecords: leaveRecords.length,
        notifications: notifications.length,
        posts: posts.length,
        documents: documents.length,
        calendarEvents: calendarEvents.length,
        contactMessages: contactMessages.length,
        auditLogs: auditLogs.length,
        totalRecords:
          sanitizedSettings.length +
          systemRoles.length +
          departments.length +
          sanitizedPersonnel.length +
          vehicles.length +
          leaveRecords.length +
          notifications.length +
          posts.length +
          documents.length +
          calendarEvents.length +
          contactMessages.length +
          auditLogs.length,
      },
      data: {
        systemSettings: sanitizedSettings,
        systemRoles,
        departments,
        personnel: sanitizedPersonnel,
        vehicles,
        leaveRecords,
        notifications,
        posts,
        documents,
        calendarEvents,
        contactMessages,
        auditLogs,
      },
    };

    // Audit log: BACKUP_CREATED
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'BACKUP_CREATED',
        entity: 'Database',
        entityId: `universal_backup_${timestampStr}.json`,
        details: `Universal JSON backup created (${backupPayload.summary.totalRecords} records, sanitized) by ${user.role}`,
        ipAddress: clientIp,
      },
    }).catch(() => {/* non-blocking */});

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const filename = `eprofile_universal_backup_${timestampStr}.json`;

    return new NextResponse(jsonString, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating backup:', error);
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการสำรองข้อมูล: ${error?.message || 'Unknown'}` }, { status: 500 });
  }
}

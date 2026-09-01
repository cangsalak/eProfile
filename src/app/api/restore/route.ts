import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

// Validate that buffer is a valid SQLite file
function isSQLiteFile(buffer: Buffer): boolean {
  const magic = 'SQLite format 3\0';
  if (buffer.length < 16) return false;
  const header = buffer.subarray(0, 16).toString('binary');
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

    const fileName = file.name.toLowerCase();
    const isJsonFile = fileName.endsWith('.json');
    const isDbFile = fileName.endsWith('.db');

    // 1. Validate extension
    if (!isJsonFile && !isDbFile) {
      return NextResponse.json({
        error: 'กรุณาอัปโหลดไฟล์สำรองข้อมูลนามสกุล .json (Universal Backup) หรือ .db (SQLite Backup) เท่านั้น'
      }, { status: 400 });
    }

    // 2. Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 500MB)' }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';

    // -------------------------------------------------------------
    // BRANCH A: Universal JSON Restore (Works on SQLite, PostgreSQL, MySQL)
    // -------------------------------------------------------------
    if (isJsonFile) {
      const fileText = await file.text();
      let backupJson: any;

      try {
        backupJson = JSON.parse(fileText);
      } catch {
        return NextResponse.json({ error: 'รูปแบบไฟล์ JSON ไม่ถูกต้อง ไม่สามารถอ่านข้อมูลได้' }, { status: 400 });
      }

      if (!backupJson || typeof backupJson !== 'object' || (!backupJson.data && !backupJson.personnel)) {
        return NextResponse.json({ error: 'โครงสร้างไฟล์สำรองข้อมูลไม่ถูกต้อง ไม่พบข้อมูลตาราง' }, { status: 400 });
      }

      const data = backupJson.data || backupJson;

      // Extract collections safely
      const systemRoles = Array.isArray(data.systemRoles) ? data.systemRoles : [];
      const departments = Array.isArray(data.departments) ? data.departments : [];
      const personnelList = Array.isArray(data.personnel) ? data.personnel : [];
      const vehicles = Array.isArray(data.vehicles) ? data.vehicles : [];
      const leaveRecords = Array.isArray(data.leaveRecords || data.leaveRequests) ? (data.leaveRecords || data.leaveRequests) : [];
      const notifications = Array.isArray(data.notifications) ? data.notifications : [];
      const posts = Array.isArray(data.posts) ? data.posts : [];
      const documents = Array.isArray(data.documents || data.personnelDocuments) ? (data.documents || data.personnelDocuments) : [];
      const calendarEvents = Array.isArray(data.calendarEvents) ? data.calendarEvents : [];
      const contactMessages = Array.isArray(data.contactMessages) ? data.contactMessages : [];
      const auditLogs = Array.isArray(data.auditLogs) ? data.auditLogs : [];
      const systemSettings = Array.isArray(data.systemSettings) ? data.systemSettings : [];

      // Perform clean atomic transaction
      await prisma.$transaction(async (tx) => {
        // 1. Delete in reverse foreign-key order
        await tx.personnelDocument.deleteMany({});
        await tx.leaveRecord.deleteMany({});
        await tx.vehicle.deleteMany({});
        await tx.calendarEvent.deleteMany({});
        await tx.contactMessage.deleteMany({});
        await tx.notification.deleteMany({});
        await tx.post.deleteMany({});
        await tx.auditLog.deleteMany({});
        await tx.personnel.deleteMany({});
        await tx.department.deleteMany({});
        await tx.systemRole.deleteMany({});
        await tx.systemSetting.deleteMany({});

        // 2. Insert parent to child
        if (systemRoles.length > 0) {
          await tx.systemRole.createMany({
            data: systemRoles.map((r: any) => ({
              id: r.id,
              name: r.name,
              displayName: r.displayName || r.name,
              description: r.description || null,
              permissions: typeof r.permissions === 'string' ? r.permissions : JSON.stringify(r.permissions || []),
              isSystem: r.isSystem ?? false,
              createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
              updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
            })),
          });
        }

        if (departments.length > 0) {
          await tx.department.createMany({
            data: departments.map((d: any) => ({
              id: d.id,
              name: d.name,
              shortName: d.shortName || null,
              subDepartments: typeof d.subDepartments === 'string' ? d.subDepartments : JSON.stringify(d.subDepartments || []),
              sortOrder: d.sortOrder || 0,
              createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
              updatedAt: d.updatedAt ? new Date(d.updatedAt) : undefined,
            })),
          });
        }

        if (personnelList.length > 0) {
          await tx.personnel.createMany({
            data: personnelList.map((p: any) => ({
              id: p.id,
              badgeNo: p.badgeNo || '',
              username: p.username || '',
              password: p.password || '',
              role: p.role || 'USER',
              prefix: p.prefix || '',
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              position: p.position || '',
              department: p.department || '',
              subDepartment: p.subDepartment || '',
              personnelType: p.personnelType || 'นายทหารสัญญาบัตร',
              phone: p.phone || '',
              mobile: p.mobile || '',
              email: p.email || '',
              status: p.status || 'ปฏิบัติงานปกติ',
              avatarColor: p.avatarColor || '#3b82f6',
              skills: typeof p.skills === 'string' ? p.skills : JSON.stringify(p.skills || []),
              education: p.education || '',
              experience: p.experience || '',
              notes: p.notes || null,
              citizenId: p.citizenId || '',
              dateOfBirth: p.dateOfBirth || '',
              bloodType: p.bloodType || '',
              religion: p.religion || '',
              officialId: p.officialId || '',
              militaryBranch: p.militaryBranch || '',
              commissionDate: p.commissionDate || '',
              currentAddress: p.currentAddress || '',
              currentTambon: p.currentTambon || '',
              currentAmphoe: p.currentAmphoe || '',
              currentProvince: p.currentProvince || '',
              currentZipcode: p.currentZipcode || '',
              emergencyContactName: p.emergencyContactName || '',
              emergencyContactPhone: p.emergencyContactPhone || '',
              emergencyContactRelation: p.emergencyContactRelation || '',
              royalDecorations: p.royalDecorations || '',
              trainingHistory: p.trainingHistory || '',
              coverPhoto: p.coverPhoto || '',
              profileTheme: p.profileTheme || 'indigo',
              mustChangePassword: p.mustChangePassword ?? true,
              failedLoginAttempts: p.failedLoginAttempts || 0,
              lockedUntil: p.lockedUntil ? new Date(p.lockedUntil) : null,
              createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
            })),
          });
        }

        if (vehicles.length > 0) {
          await tx.vehicle.createMany({
            data: vehicles.map((v: any) => ({
              id: v.id,
              personnelId: v.personnelId,
              type: v.type || 'รถยนต์',
              licensePlate: v.licensePlate || '',
              brand: v.brand || '',
              model: v.model || '',
              color: v.color || '',
              photoFront: v.photoFront || null,
              photoBack: v.photoBack || null,
              photoSide: v.photoSide || null,
              createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
              updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
            })),
          });
        }

        if (leaveRecords.length > 0) {
          await tx.leaveRecord.createMany({
            data: leaveRecords.map((l: any) => ({
              id: l.id,
              personnelId: l.personnelId,
              leaveType: l.leaveType,
              startDate: new Date(l.startDate),
              endDate: new Date(l.endDate),
              reason: l.reason || null,
              writtenAt: l.writtenAt || null,
              toPerson: l.toPerson || null,
              contactAddress: l.contactAddress || null,
              contactTambon: l.contactTambon || null,
              contactAmphoe: l.contactAmphoe || null,
              contactProvince: l.contactProvince || null,
              status: l.status || 'รออนุมัติ',
              substitutePerson: l.substitutePerson || null,
              accumulatedLeaveDays: l.accumulatedLeaveDays != null ? Number(l.accumulatedLeaveDays) : null,
              thisYearLeaveDays: l.thisYearLeaveDays != null ? Number(l.thisYearLeaveDays) : null,
              totalLeaveDays: l.totalLeaveDays != null ? Number(l.totalLeaveDays) : null,
              ordainedBefore: l.ordainedBefore ?? false,
              ordainTempleName: l.ordainTempleName || null,
              ordainTempleLocation: l.ordainTempleLocation || null,
              ordainDate: l.ordainDate ? new Date(l.ordainDate) : null,
              stayTempleName: l.stayTempleName || null,
              stayTempleLocation: l.stayTempleLocation || null,
              maternityLeaveTimes: l.maternityLeaveTimes != null ? Number(l.maternityLeaveTimes) : null,
              maternityLeaveDays: l.maternityLeaveDays != null ? Number(l.maternityLeaveDays) : null,
              createdAt: l.createdAt ? new Date(l.createdAt) : undefined,
              updatedAt: l.updatedAt ? new Date(l.updatedAt) : undefined,
            })),
          });
        }

        if (notifications.length > 0) {
          await tx.notification.createMany({
            data: notifications.map((n: any) => ({
              id: n.id,
              personnelId: n.personnelId || n.recipientId,
              title: n.title,
              message: n.message,
              type: n.type || 'info',
              link: n.link || null,
              isRead: n.isRead ?? false,
              createdAt: n.createdAt ? new Date(n.createdAt) : undefined,
            })),
          });
        }

        if (posts.length > 0) {
          await tx.post.createMany({
            data: posts.map((po: any) => ({
              id: po.id,
              title: po.title,
              content: po.content,
              category: po.category || 'ข่าวทั่วไป',
              image: po.image || po.coverImage || null,
              authorId: po.authorId,
              published: po.published ?? true,
              createdAt: po.createdAt ? new Date(po.createdAt) : undefined,
              updatedAt: po.updatedAt ? new Date(po.updatedAt) : undefined,
            })),
          });
        }

        if (documents.length > 0) {
          await tx.personnelDocument.createMany({
            data: documents.map((doc: any) => ({
              id: doc.id,
              personnelId: doc.personnelId,
              category: doc.category || 'คำสั่ง',
              filename: doc.filename || doc.title || doc.name || 'document.pdf',
              mimeType: doc.mimeType || doc.fileType || 'application/pdf',
              size: Number(doc.size || doc.fileSize || 0),
              storagePath: doc.storagePath || doc.fileUrl || '',
              uploadedBy: doc.uploadedBy || '',
              notes: doc.notes || null,
              createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
              updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
              expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : null,
            })),
          });
        }

        if (calendarEvents.length > 0) {
          await tx.calendarEvent.createMany({
            data: calendarEvents.map((c: any) => ({
              id: c.id,
              title: c.title,
              description: c.description || null,
              startDate: new Date(c.startDate),
              endDate: new Date(c.endDate),
              type: c.type || 'general',
              createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
              updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
            })),
          });
        }

        if (contactMessages.length > 0) {
          await tx.contactMessage.createMany({
            data: contactMessages.map((cm: any) => ({
              id: cm.id,
              name: cm.name,
              email: cm.email,
              phone: cm.phone || null,
              message: cm.message,
              status: cm.status || 'unread',
              createdAt: cm.createdAt ? new Date(cm.createdAt) : undefined,
              updatedAt: cm.updatedAt ? new Date(cm.updatedAt) : undefined,
            })),
          });
        }

        if (auditLogs.length > 0) {
          await tx.auditLog.createMany({
            data: auditLogs.map((a: any) => ({
              id: a.id,
              personnelId: a.personnelId || null,
              action: a.action,
              entity: a.entity,
              entityId: a.entityId || null,
              details: a.details || null,
              ipAddress: a.ipAddress || null,
              createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
            })),
          });
        }

        if (systemSettings.length > 0) {
          await tx.systemSetting.createMany({
            data: systemSettings.map((s: any) => ({
              id: s.id,
              key: s.key,
              value: s.value,
            })),
          });
        }
      });

      const totalRestored =
        personnelList.length +
        leaveRecords.length +
        vehicles.length +
        departments.length +
        systemRoles.length +
        notifications.length +
        posts.length +
        documents.length;

      // Record Audit Log
      await prisma.auditLog.create({
        data: {
          personnelId: user.id,
          action: 'BACKUP_RESTORED',
          entity: 'Database',
          entityId: file.name,
          details: `Universal JSON backup restored (${totalRestored} items) by ${user.role}`,
          ipAddress: clientIp,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        message: `กู้คืนข้อมูลสำเร็จเรียบร้อยแล้ว (รวม ${totalRestored} รายการ)`,
        format: 'universal_json',
        summary: {
          personnel: personnelList.length,
          leaveRecords: leaveRecords.length,
          vehicles: vehicles.length,
          departments: departments.length,
          systemRoles: systemRoles.length,
          posts: posts.length,
          documents: documents.length,
        },
      });
    }

    // -------------------------------------------------------------
    // BRANCH B: Binary .db File Restore (For SQLite)
    // -------------------------------------------------------------
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate SQLite magic bytes
    if (!isSQLiteFile(buffer)) {
      return NextResponse.json({ error: 'ไฟล์ที่อัปโหลดไม่ใช่ฐานข้อมูล SQLite ที่ถูกต้อง' }, { status: 400 });
    }

    // Create safety backup of current DB before overwriting
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, safetyBackupPath);
    }

    // Disconnect Prisma to release file locks
    await prisma.$disconnect();

    const walPath = path.join(process.cwd(), 'prisma', 'dev.db-wal');
    const shmPath = path.join(process.cwd(), 'prisma', 'dev.db-shm');

    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

    // Atomic write
    const tmpPath = dbPath + '.tmp';
    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, dbPath);

    // Clean up safety backup after successful restore
    if (fs.existsSync(safetyBackupPath)) {
      fs.unlinkSync(safetyBackupPath);
    }

    // Reconnect & Audit
    await prisma.$connect();
    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'BACKUP_RESTORED',
        entity: 'Database',
        entityId: 'dev.db',
        details: `SQLite database restored from binary file: ${file.name} by ${user.role}`,
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'กู้คืนฐานข้อมูล SQLite สำเร็จเรียบร้อยแล้ว',
      format: 'sqlite_db',
    });
  } catch (error: any) {
    console.error('Error during database restore:', error);
    // If safety backup exists, attempt rollback
    if (fs.existsSync(safetyBackupPath) && !fs.existsSync(dbPath)) {
      try {
        fs.copyFileSync(safetyBackupPath, dbPath);
      } catch {}
    }
    return NextResponse.json({
      error: `เกิดข้อผิดพลาดในการกู้คืนฐานข้อมูล: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}

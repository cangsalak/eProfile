import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import JSZip from 'jszip';
import { z } from 'zod';
import { prisma } from '@/modules/core';
import { requireRole } from '@/modules/core';
import { ALL_SYSTEM_MODULES } from '@/modules/core';
import { mergeSchemas } from '@/modules/core';
import { ModuleScriptsSchema, compareVersions, executeLifecycleScript } from './lifecycle-helper';

const FORBIDDEN_EXTENSIONS = [
  '.exe', '.sh', '.bat', '.cmd', '.bin', '.elf', '.so', '.dylib', '.dll', '.com', '.vbs', '.ps1'
];

const ManifestSchema = z.object({
  id: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Module ID ต้องประกอบด้วยตัวพิมพ์เล็ก ตัวเลข และเครื่องหมายขีดกลางเท่านั้น'),
  name: z.string().min(2),
  nameEn: z.string().optional(),
  description: z.string().default(''),
  version: z.string().min(1),
  author: z.string().optional(),
  icon: z.string().default('fa-box'),
  category: z.enum(['core', 'hr', 'operations', 'tools', 'system']).default('tools'),
  isCore: z.boolean().default(false),
  defaultEnabled: z.boolean().default(true),
  menus: z.array(z.object({
    id: z.string(),
    title: z.string(),
    icon: z.string(),
    path: z.string(),
    requiredPermission: z.string().optional(),
    order: z.number().default(50),
  })).default([]),
  permissions: z.array(z.object({
    key: z.string(),
    name: z.string(),
    description: z.string(),
  })).default([]),
  scripts: ModuleScriptsSchema,
});

export async function handleUpdateModule(request: Request) {
  try {
    const { error, user } = await requireRole(request, ['SUPER_ADMIN']);
    if (error || !user) {
      return error || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้ดูแลระบบระดับสูง (SUPER_ADMIN) เท่านั้นที่สามารถอัปเดตโมดูลได้' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่อัปโหลด' }, { status: 400 });
    }

    // 1. File extension validation
    if (!file.name.toLowerCase().endsWith('.zip')) {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์โมดูลนามสกุล .zip เท่านั้น' }, { status: 400 });
    }

    // 2. File size validation (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'ไฟล์โมดูลมีขนาดใหญ่เกินไป (สูงสุด 50MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 3. Magic Bytes validation
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return NextResponse.json({ error: 'ไฟล์ที่อัปโหลดไม่ใช่ไฟล์ ZIP ที่ถูกต้อง' }, { status: 400 });
    }

    // 3.1 Raw Buffer Zip Slip detection
    if (buffer.includes(Buffer.from('../')) || buffer.includes(Buffer.from('..\\'))) {
      return NextResponse.json({ error: 'พบไฟล์ที่มีเส้นทางไม่ปลอดภัย (Zip Slip attempt): มีลำดับ .. ในชื่อไฟล์' }, { status: 400 });
    }

    // 4. Load ZIP archive
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(buffer);
    } catch {
      return NextResponse.json({ error: 'ไม่สามารถเปิดอ่านไฟล์ ZIP ได้ ไฟล์อาจเสียหาย' }, { status: 400 });
    }

    // 5. Look for manifest.json
    const manifestFile = zip.file('manifest.json') || Object.values(zip.files).find(f => f.name.endsWith('manifest.json') && !f.name.includes('/'));
    if (!manifestFile) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ manifest.json ในไฟล์ ZIP กรุณาตรวจสอบโครงสร้างโมดูล' }, { status: 400 });
    }

    const manifestText = await manifestFile.async('text');
    let rawManifest: any;
    try {
      rawManifest = JSON.parse(manifestText);
    } catch {
      return NextResponse.json({ error: 'ไฟล์ manifest.json มีรูปแบบ JSON ไม่ถูกต้อง' }, { status: 400 });
    }

    const parseResult = ManifestSchema.safeParse(rawManifest);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json({ error: `ข้อมูล manifest.json ไม่ถูกต้อง: ${errorMsg}` }, { status: 400 });
    }

    const newManifest = parseResult.data;

    // 6. Core Module & Route collision protection
    const RESERVED_CORE_MODULE_IDS = [
      ...ALL_SYSTEM_MODULES.map(m => m.id),
      'personnel',
      'site-content',
      'system-inspector',
      'core',
      'auth',
      'settings',
      'install',
      'modules',
    ];
    if (RESERVED_CORE_MODULE_IDS.includes(newManifest.id)) {
      return NextResponse.json({ error: `ไม่อนุญาตให้อัปเดต Core Module ของระบบ ("${newManifest.id}")` }, { status: 400 });
    }

    const RESERVED_CORE_ROUTES = ['settings', 'manage', 'api', 'auth', 'personnel', 'leaves', 'badges', 'calendar', 'news', 'contacts', 'dashboard', 'profile', 'admin', 'inspector'];
    for (const menu of newManifest.menus) {
      if (menu.path) {
        const topRoute = menu.path.replace(/^\//, '').split('/')[0]?.toLowerCase();
        if (topRoute && RESERVED_CORE_ROUTES.includes(topRoute)) {
          return NextResponse.json({
            error: `โมดูลนี้กำหนดเส้นทาง "${menu.path}" ซึ่งทับซ้อนกับระบบหลักของ eProfile ไม่อนุญาตให้อัปเดต`
          }, { status: 400 });
        }
      }
    }

    // 7. Verify Module is already installed and check version comparison
    const targetModuleDir = path.resolve(process.cwd(), 'src', 'modules', newManifest.id);
    if (!fs.existsSync(targetModuleDir)) {
      return NextResponse.json({
        error: `ไม่พบโมดูล "${newManifest.id}" ในระบบ กรุณาใช้ฟังก์ชันติดตั้งโมดูลใหม่`,
      }, { status: 400 });
    }

    const existingManifestPath = path.join(targetModuleDir, 'manifest.json');
    let currentVersion = '0.0.0';
    if (fs.existsSync(existingManifestPath)) {
      try {
        const existingManifest = JSON.parse(fs.readFileSync(existingManifestPath, 'utf-8'));
        if (existingManifest.version) {
          currentVersion = existingManifest.version;
        }
      } catch (err) {
        console.warn('Could not parse existing manifest version', err);
      }
    }

    if (compareVersions(newManifest.version, currentVersion) <= 0) {
      return NextResponse.json({
        error: `ไม่อนุญาตให้อัปเดตเป็นเวอร์ชันที่ต่ำกว่าหรือเท่ากับเวอร์ชันปัจจุบัน (เวอร์ชันปัจจุบัน: v${currentVersion}, เวอร์ชันที่อัปโหลด: v${newManifest.version})`,
      }, { status: 400 });
    }

    // 8. Security: Zip Slip and Malicious Extension checks
    for (const relativePath of Object.keys(zip.files)) {
      const entry = zip.files[relativePath];
      if (entry.dir) continue;

      const normalizedPath = path.normalize(relativePath);
      if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath) || relativePath.includes('..')) {
        return NextResponse.json({ error: `พบไฟล์ที่มีเส้นทางไม่ปลอดภัย (Zip Slip attempt): ${relativePath}` }, { status: 400 });
      }

      const destPath = path.resolve(targetModuleDir, normalizedPath);
      if (!destPath.startsWith(targetModuleDir + path.sep) && destPath !== targetModuleDir) {
        return NextResponse.json({ error: `พบไฟล์ที่พยายามแตกออกนอกโฟลเดอร์โมดูล: ${relativePath}` }, { status: 400 });
      }

      const ext = path.extname(relativePath).toLowerCase();
      if (FORBIDDEN_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: `ไม่อนุญาตให้อัปโหลดไฟล์ชนิดที่เป็นอันตราย: ${ext}` }, { status: 400 });
      }
    }

    // 9. Safe Extraction / Overwrite
    fs.mkdirSync(targetModuleDir, { recursive: true });

    for (const relativePath of Object.keys(zip.files)) {
      const entry = zip.files[relativePath];
      const normalizedPath = path.normalize(relativePath);
      const destPath = path.resolve(targetModuleDir, normalizedPath);

      if (entry.dir) {
        fs.mkdirSync(destPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        const content = await entry.async('nodebuffer');
        fs.writeFileSync(destPath, content);
      }
    }

    // 10. Auto-migrate DB schema if module has schema.prisma
    const moduleSchemaPath = path.join(targetModuleDir, 'schema.prisma');
    if (fs.existsSync(moduleSchemaPath)) {
      try {
        mergeSchemas();
        execSync('npx prisma db push --skip-generate', {
          cwd: process.cwd(),
          stdio: 'pipe',
          env: { ...process.env },
        });
        execSync('npx prisma generate', {
          cwd: process.cwd(),
          stdio: 'pipe',
          env: { ...process.env },
        });
      } catch (schemaErr: any) {
        console.error('Module schema update failed:', schemaErr.message);
        return NextResponse.json({
          error: `อัปเดต schema ไม่สำเร็จ: ${schemaErr.stderr?.toString() || schemaErr.message}`,
        }, { status: 500 });
      }
    }

    // 11. Execute Update Hook Script if defined
    if (newManifest.scripts?.update) {
      const scriptRes = executeLifecycleScript(newManifest.scripts.update, targetModuleDir);
      if (!scriptRes.success) {
        console.error('Module update script execution failed:', scriptRes.error);
        return NextResponse.json({
          error: scriptRes.error || 'การประมวลผล Update Script ล้มเหลว',
        }, { status: 500 });
      }
    }

    // 12. Update installed-modules.json
    const registryFile = path.resolve(process.cwd(), 'src', 'modules', 'installed-modules.json');
    let installedList: any[] = [];
    if (fs.existsSync(registryFile)) {
      try {
        installedList = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
        if (!Array.isArray(installedList)) installedList = [];
      } catch {
        installedList = [];
      }
    }

    const previousRecord = installedList.find(m => m.id === newManifest.id);
    installedList = installedList.filter(m => m.id !== newManifest.id);
    installedList.push({
      ...newManifest,
      installedAt: previousRecord?.installedAt || new Date().toISOString(),
      installedBy: previousRecord?.installedBy || user.id,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    });
    fs.writeFileSync(registryFile, JSON.stringify(installedList, null, 2), 'utf-8');

    // 13. AuditLog
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'MODULE_UPDATED',
        entity: 'Module',
        entityId: newManifest.id,
        details: JSON.stringify({
          name: newManifest.name,
          previousVersion: currentVersion,
          newVersion: newManifest.version,
          author: newManifest.author,
          menusCount: newManifest.menus.length,
          permissionsCount: newManifest.permissions.length,
        }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `อัปเดตโมดูล "${newManifest.name}" เป็นเวอร์ชัน v${newManifest.version} สำเร็จ`,
      manifest: newManifest,
    });
  } catch (err: any) {
    console.error('Module update error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการอัปเดตโมดูล' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';

export const dynamic = 'force-dynamic';

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
});

export async function POST(request: Request) {
  try {
    const { error, user } = await requireRole(request, ['SUPER_ADMIN']);
    if (error || !user) {
      return error || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้ดูแลระบบระดับสูง (SUPER_ADMIN) เท่านั้นที่สามารถติดตั้งโมดูลได้' }, { status: 401 });
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

    // 3. Magic Bytes validation (ZIP header starts with PK\x03\x04 or 0x50 0x4B 0x03 0x04)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return NextResponse.json({ error: 'ไฟล์ที่อัปโหลดไม่ใช่ไฟล์ ZIP ที่ถูกต้อง' }, { status: 400 });
    }

    // 3.1 Raw Buffer Zip Slip detection (check for directory traversal patterns)
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

    const manifest = parseResult.data;

    // 6. Core Module & Route collision protection
    const coreIds = ALL_SYSTEM_MODULES.map(m => m.id);
    if (coreIds.includes(manifest.id)) {
      return NextResponse.json({ error: `ไม่อนุญาตให้ติดตั้งทับ Core Module ของระบบ ("${manifest.id}")` }, { status: 400 });
    }

    const RESERVED_CORE_ROUTES = ['settings', 'manage', 'api', 'auth', 'personnel', 'leaves', 'vehicles', 'badges', 'calendar', 'news', 'contacts', 'dashboard', 'profile', 'admin', 'inspector'];
    for (const menu of manifest.menus) {
      if (menu.path) {
        const topRoute = menu.path.replace(/^\//, '').split('/')[0]?.toLowerCase();
        if (topRoute && RESERVED_CORE_ROUTES.includes(topRoute)) {
          return NextResponse.json({
            error: `โมดูลนี้กำหนดเส้นทาง "${menu.path}" ซึ่งทับซ้อนกับระบบหลักของ eProfile ไม่อนุญาตให้ติดตั้ง`
          }, { status: 400 });
        }
      }
    }


    // 7. Security: Zip Slip and Malicious Extension checks
    const targetModuleDir = path.resolve(process.cwd(), 'src', 'modules', manifest.id);
    
    // Check all files before writing anything
    for (const relativePath of Object.keys(zip.files)) {
      const entry = zip.files[relativePath];
      if (entry.dir) continue;

      // Zip Slip check
      const normalizedPath = path.normalize(relativePath);
      if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath) || relativePath.includes('..')) {
        return NextResponse.json({ error: `พบไฟล์ที่มีเส้นทางไม่ปลอดภัย (Zip Slip attempt): ${relativePath}` }, { status: 400 });
      }

      const destPath = path.resolve(targetModuleDir, normalizedPath);
      if (!destPath.startsWith(targetModuleDir + path.sep) && destPath !== targetModuleDir) {
        return NextResponse.json({ error: `พบไฟล์ที่พยายามแตกออกนอกโฟลเดอร์โมดูล: ${relativePath}` }, { status: 400 });
      }

      // Check forbidden extensions
      const ext = path.extname(relativePath).toLowerCase();
      if (FORBIDDEN_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: `ไม่อนุญาตให้อัปโหลดไฟล์ชนิดที่เป็นอันตราย: ${ext}` }, { status: 400 });
      }
    }

    // 8. Safe extraction
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

    // 9. Auto-create Thin Controller pages for menus if necessary
    for (const menu of manifest.menus) {
      if (menu.path && menu.path.startsWith('/')) {
        const cleanRoute = menu.path.replace(/^\//, '').trim();
        // Check if route already exists
        const pageDir = path.resolve(process.cwd(), 'src', 'app', '(member)', cleanRoute);
        const pageFile = path.join(pageDir, 'page.tsx');

        if (!fs.existsSync(pageFile) && !cleanRoute.includes('..')) {
          fs.mkdirSync(pageDir, { recursive: true });
          
          // Generate thin controller
          const controllerContent = `'use client';

import React from 'react';
// Dynamic import from the installed module
import * as ModuleBundle from '@/modules/${manifest.id}';

export default function InstalledModulePage() {
  // Check if module has a primary view or component
  const Component = (ModuleBundle as any).default || Object.values(ModuleBundle).find(v => typeof v === 'function');

  if (Component) {
    return <Component />;
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        ${manifest.name}
      </h1>
      <p className="text-slate-500 dark:text-slate-400">
        ${manifest.description || 'โมดูลส่วนเสริมได้รับการติดตั้งแล้ว'}
      </p>
    </div>
  );
}
`;
          fs.writeFileSync(pageFile, controllerContent, 'utf-8');
        }
      }
    }

    // 10. Update installed-modules.json
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

    // Upsert manifest in installed-modules.json
    installedList = installedList.filter(m => m.id !== manifest.id);
    installedList.push({
      ...manifest,
      installedAt: new Date().toISOString(),
      installedBy: user.id,
    });
    fs.writeFileSync(registryFile, JSON.stringify(installedList, null, 2), 'utf-8');

    // 11. Enable module in SystemSetting
    const currentSettings = await prisma.systemSetting.findMany();
    const enabledModulesRecord = currentSettings.find(s => s.key === 'enabledModules');
    let enabledModules: string[] = [];

    if (enabledModulesRecord?.value) {
      try {
        enabledModules = JSON.parse(enabledModulesRecord.value);
      } catch {
        enabledModules = [];
      }
    } else {
      enabledModules = ALL_SYSTEM_MODULES.map(m => m.id);
    }

    if (!enabledModules.includes(manifest.id)) {
      enabledModules.push(manifest.id);
      await prisma.systemSetting.upsert({
        where: { key: 'enabledModules' },
        update: { value: JSON.stringify(enabledModules) },
        create: { key: 'enabledModules', value: JSON.stringify(enabledModules) },
      });
    }

    // 12. AuditLog
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'MODULE_INSTALLED',
        entity: 'Module',
        entityId: manifest.id,
        details: JSON.stringify({
          name: manifest.name,
          version: manifest.version,
          author: manifest.author,
          menusCount: manifest.menus.length,
          permissionsCount: manifest.permissions.length,
        }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `ติดตั้งโมดูล "${manifest.name}" (v${manifest.version}) สำเร็จ`,
      manifest,
    });
  } catch (err: any) {
    console.error('Module installation error:', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการติดตั้งโมดูล' }, { status: 500 });
  }
}

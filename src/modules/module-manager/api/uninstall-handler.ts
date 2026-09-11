import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';

export async function handleUninstallModule(
  request: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['SUPER_ADMIN']);
    if (error || !user) {
      return error || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้ดูแลระบบระดับสูงเท่านั้น' }, { status: 401 });
    }

    const moduleId = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!moduleId || !/^[a-z0-9-]+$/.test(moduleId)) {
      return NextResponse.json({ error: 'รหัสโมดูลไม่ถูกต้อง' }, { status: 400 });
    }

    // Protect core modules
    const coreIds = ALL_SYSTEM_MODULES.map(m => m.id);
    if (coreIds.includes(moduleId)) {
      return NextResponse.json({ error: `ไม่อนุญาตให้ถอนการติดตั้ง Core Module ของระบบ ("${moduleId}")` }, { status: 400 });
    }

    const targetModuleDir = path.resolve(process.cwd(), 'src', 'modules', moduleId);
    const modulesRoot = path.resolve(process.cwd(), 'src', 'modules');

    if (!targetModuleDir.startsWith(modulesRoot + path.sep)) {
      return NextResponse.json({ error: 'Invalid module path' }, { status: 400 });
    }

    // 1. Delete module folder if exists
    if (fs.existsSync(targetModuleDir)) {
      fs.rmSync(targetModuleDir, { recursive: true, force: true });
    }

    // 2. Remove from installed-modules.json
    const registryFile = path.resolve(process.cwd(), 'src', 'modules', 'installed-modules.json');
    if (fs.existsSync(registryFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
        if (Array.isArray(list)) {
          list = list.filter((m: any) => m.id !== moduleId);
          fs.writeFileSync(registryFile, JSON.stringify(list, null, 2), 'utf-8');
        }
      } catch (e) {
        console.error('Error updating installed-modules.json', e);
      }
    }

    // 3. Remove from enabledModules setting
    const currentSettings = await prisma.systemSetting.findMany();
    const enabledModulesRecord = currentSettings.find(s => s.key === 'enabledModules');
    if (enabledModulesRecord?.value) {
      try {
        let enabledModules: string[] = JSON.parse(enabledModulesRecord.value);
        if (Array.isArray(enabledModules) && enabledModules.includes(moduleId)) {
          enabledModules = enabledModules.filter(id => id !== moduleId);
          await prisma.systemSetting.upsert({
            where: { key: 'enabledModules' },
            update: { value: JSON.stringify(enabledModules) },
            create: { key: 'enabledModules', value: JSON.stringify(enabledModules) },
          });
        }
      } catch (e) {
        console.error('Error updating enabledModules', e);
      }
    }

    // 4. Audit Log
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        personnelId: user.id,
        action: 'MODULE_UNINSTALLED',
        entity: 'Module',
        entityId: moduleId,
        details: JSON.stringify({ moduleId }),
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `ถอนการติดตั้งโมดูล "${moduleId}" เรียบร้อยแล้ว`,
    });
  } catch (err: any) {
    console.error('Failed to uninstall module', err);
    return NextResponse.json({ error: err.message || 'เกิดข้อผิดพลาดในการถอนการติดตั้งโมดูล' }, { status: 500 });
  }
}

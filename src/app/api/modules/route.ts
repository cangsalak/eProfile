import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ALL_SYSTEM_MODULES } from '@/lib/modules';
import { requireAuth } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const registryFile = path.resolve(process.cwd(), 'src', 'modules', 'installed-modules.json');
    let customModules: any[] = [];

    if (fs.existsSync(registryFile)) {
      try {
        customModules = JSON.parse(fs.readFileSync(registryFile, 'utf-8'));
        if (!Array.isArray(customModules)) customModules = [];
      } catch {
        customModules = [];
      }
    }

    // Combine built-in modules with custom installed modules
    const allModules = [...ALL_SYSTEM_MODULES];

    for (const custom of customModules) {
      if (!allModules.some(m => m.id === custom.id)) {
        allModules.push(custom);
      }
    }

    // Check Authentication Level
    const { user } = await requireAuth(request);
    const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');

    if (!isAdmin) {
      // Return Sanitized Public/Standard Module Metadata
      const sanitizedModules = allModules.map(m => ({
        id: m.id,
        name: m.name,
        nameEn: m.nameEn,
        icon: m.icon,
        category: m.category,
        isCore: m.isCore,
        defaultEnabled: m.defaultEnabled,
      }));

      return NextResponse.json({
        modules: sanitizedModules,
        customModules: customModules.map(m => ({
          id: m.id,
          name: m.name,
          nameEn: m.nameEn,
          icon: m.icon,
          category: m.category,
          isCore: m.isCore,
          defaultEnabled: m.defaultEnabled,
        })),
      });
    }

    // Full metadata for Admins
    return NextResponse.json({
      modules: allModules,
      customModules,
    });
  } catch (err: any) {
    console.error('Failed to get modules:', err);
    return NextResponse.json({ error: 'ไม่สามารถดึงรายการโมดูลได้' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { ModuleRegistry } from '@/modules/core/registry';
import { requireAuth } from '@/modules/core/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get all system modules registered (both core and extensions)
    const allModules = ModuleRegistry.getAllModules();
    
    // Optional: Only return full metadata if admin, otherwise sanitize
    let user;
    try {
      const auth = await requireAuth(request);
      user = auth.user;
    } catch {
      user = null;
    }

    const isAdmin = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');
    
    if (!isAdmin) {
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
        customModules: [], // customModules are now handled automatically via sync script
      });
    }

    return NextResponse.json({
      modules: allModules,
      customModules: [],
    });
  } catch (err: any) {
    console.error('Failed to get modules:', err);
    return NextResponse.json({ error: 'ไม่สามารถดึงรายการโมดูลได้' }, { status: 500 });
  }
}

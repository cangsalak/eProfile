import { verifyAuth } from './auth';
import { NextResponse } from 'next/server';

export async function requireAuth(req: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user };
}

export async function requireRole(req: Request, allowedRoles: string[]) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!allowedRoles.includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden: Insufficient role' }, { status: 403 }) };
  }
  return { user };
}

export async function requirePermission(req: Request, permission: string) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  
  if (user.role === 'SUPER_ADMIN') {
    return { user };
  }

  // Fetch role permissions from DB
  const { prisma } = await import('@/lib/prisma');
  const role = await prisma.systemRole.findUnique({
    where: { name: user.role }
  });

  if (role && role.permissions) {
    try {
      const perms: string[] = JSON.parse(role.permissions);
      if (perms.includes(permission)) {
        return { user };
      }
    } catch (e) {
      console.error('Error parsing role permissions', e);
    }
  }

  return { error: NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 }) };
}


export async function requireModuleEnabled(moduleId: string) {
  const { prisma } = await import('@/lib/prisma');
  const modSetting = await prisma.systemSetting.findUnique({
    where: { key: 'enabledModules' },
  });
  if (modSetting && modSetting.value) {
    try {
      const enabled: string[] = JSON.parse(modSetting.value);
      if (Array.isArray(enabled) && !enabled.includes(moduleId)) {
        return {
          error: NextResponse.json(
            { error: `โมดูล ${moduleId} ถูกปิดใช้งานในระบบ`, moduleDisabled: true },
            { status: 403 }
          ),
        };
      }
    } catch {
      // ignore
    }
  }
  return { enabled: true };
}


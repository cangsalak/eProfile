import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { apiError, apiSuccess } from '@/lib/api-response';

const SETTING_KEY = 'menuOverrides';

export interface MenuOverride {
  id: string;
  title?: string;
  path?: string;
  order?: number;
  enabled?: boolean;
  icon?: string;
  isCustom?: boolean;
  requiredRoles?: string[];
  requiredPermission?: string;
  subItems?: { name: string; path: string; requiredPermission?: string }[];
}

export async function GET(request: Request) {
  const { error } = await requirePermission(request, 'MANAGE_SYSTEM');
  if (error) return error;

  const setting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
  let overrides: MenuOverride[] = [];
  try {
    const parsed = setting?.value ? JSON.parse(setting.value) : [];
    if (Array.isArray(parsed)) overrides = parsed;
  } catch {
    overrides = [];
  }

  return apiSuccess({ overrides });
}

export async function PUT(request: Request) {
  const { error } = await requirePermission(request, 'MANAGE_SYSTEM');
  if (error) return error;

  const body = await request.json();
  if (!Array.isArray(body?.overrides)) {
    return apiError('รูปแบบข้อมูลเมนูไม่ถูกต้อง', 400);
  }

  const overrides: MenuOverride[] = body.overrides.filter((item: unknown): item is MenuOverride => {
    if (!item || typeof item !== 'object') return false;
    const value = item as Record<string, unknown>;
    return typeof value.id === 'string' && /^[a-z0-9-_]+$/i.test(value.id)
      && (value.title === undefined || typeof value.title === 'string')
      && (value.path === undefined || (typeof value.path === 'string' && value.path.startsWith('/')))
      && (value.order === undefined || Number.isInteger(value.order))
      && (value.enabled === undefined || typeof value.enabled === 'boolean')
      && (value.icon === undefined || typeof value.icon === 'string')
      && (value.isCustom === undefined || typeof value.isCustom === 'boolean')
      && (value.subItems === undefined || Array.isArray(value.subItems));
  });

  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(overrides) },
    create: { key: SETTING_KEY, value: JSON.stringify(overrides) },
  });

  return apiSuccess({ success: true, overrides });
}


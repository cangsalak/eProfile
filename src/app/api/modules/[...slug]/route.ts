import { NextResponse } from 'next/server';
import { ModuleApiRegistry } from '@/lib/modules/api-registry';
import { ModuleRegistry } from '@/lib/modules/registry';
import { prisma } from '@/lib/prisma';
import { HttpMethod } from '@/lib/modules/types';

export const dynamic = 'force-dynamic';

/**
 * Universal Module API Dispatcher
 * Handles all requests targeting /api/modules/[moduleId]/[...subPath]
 */
async function dispatchModuleApi(
  req: Request,
  method: HttpMethod,
  context: { params: { slug?: string[] } }
) {
  const slug = context.params.slug || [];
  if (slug.length === 0) {
    return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
  }

  const moduleId = slug[0];
  const subPath = slug.slice(1).join('/');

  // 1. Fetch Module Manifest & API Map
  const allModules = ModuleRegistry.getAllModules();
  const manifest = allModules.find((m) => m.id === moduleId);
  const apiMap = ModuleApiRegistry.get(moduleId);

  if (!manifest || !apiMap) {
    return NextResponse.json(
      { error: `Module "${moduleId}" not found in registry` },
      { status: 404 }
    );
  }

  // 2. Check if Module is Enabled in DB (Skip check for Core modules)
  if (!manifest.isCore) {
    try {
      const isPostgres = process.env.DATABASE_URL?.includes('postgres');
      let isEnabled = manifest.defaultEnabled;

      if (isPostgres) {
        const setting = await (prisma as any).appSetting.findUnique({
          where: { key: `module_enabled_${moduleId}` },
        });
        if (setting) {
          isEnabled = setting.value === 'true' || setting.value === true;
        }
      } else {
        const setting = await (prisma as any).setting.findUnique({
          where: { key: `module_enabled_${moduleId}` },
        });
        if (setting) {
          isEnabled = setting.value === 'true' || setting.value === true;
        }
      }

      if (!isEnabled) {
        return NextResponse.json(
          { error: `Module "${moduleId}" is currently disabled` },
          { status: 403 }
        );
      }
    } catch {
      // Fallback to defaultEnabled if DB query fails
      if (!manifest.defaultEnabled) {
        return NextResponse.json(
          { error: `Module "${moduleId}" is disabled by default` },
          { status: 403 }
        );
      }
    }
  }

  // 3. Resolve API Route Handler
  let matchedHandler: any = null;
  const extractedParams: Record<string, string | string[]> = { moduleId, subPath };

  // 3.1 Exact match
  if (apiMap[subPath] && apiMap[subPath]![method]) {
    matchedHandler = apiMap[subPath]![method];
  } else {
    // 3.2 Dynamic pattern match (e.g. tokens/[id] -> tokens/123)
    for (const pattern of Object.keys(apiMap)) {
      if (!pattern.includes('[')) continue;

      const paramNames: string[] = [];
      const regexPattern = pattern.replace(/\[([^\]]+)\]/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
      });

      const regex = new RegExp(`^${regexPattern}$`);
      const match = subPath.match(regex);

      if (match) {
        paramNames.forEach((name, idx) => {
          extractedParams[name] = match[idx + 1];
        });

        if (apiMap[pattern] && apiMap[pattern]![method]) {
          matchedHandler = apiMap[pattern]![method];
          break;
        }
      }
    }
  }

  if (!matchedHandler) {
    return NextResponse.json(
      { error: `Endpoint "${method} /api/modules/${moduleId}/${subPath}" not supported` },
      { status: 404 }
    );
  }

  // 4. Execute the Handler
  try {
    return await matchedHandler(req, { params: extractedParams });
  } catch (error: any) {
    console.error(`[Module API Error] ${moduleId}/${subPath}:`, error);
    return NextResponse.json(
      { error: error.message || 'Internal Module API Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'GET', context);
}

export async function POST(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'POST', context);
}

export async function PUT(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'PUT', context);
}

export async function PATCH(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'PATCH', context);
}

export async function DELETE(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'DELETE', context);
}

export async function HEAD(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'HEAD', context);
}

export async function OPTIONS(req: Request, context: { params: { slug?: string[] } }) {
  return dispatchModuleApi(req, 'OPTIONS', context);
}

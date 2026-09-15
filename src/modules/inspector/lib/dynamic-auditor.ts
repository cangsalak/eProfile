import fs from 'fs';
import path from 'path';
import { ModuleRegistry } from '@/modules/core/registry';
import { ModuleApiRegistry } from '@/modules/core/api-registry';
import { prisma } from '@/modules/core';

export interface DynamicTestSuite {
  id: string;
  name: string;
  file: string;
  category: string;
  description: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'NOT_VERIFIED';
}

export interface DynamicModuleAudit {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  version: string;
  isCore: boolean;
  isEnabled: boolean;
  hasManifest: boolean;
  hasIndex: boolean;
  hasViews: boolean;
  hasLib: boolean;
  hasSchema: boolean;
  hasApi: boolean;
  apiEndpointsCount: number;
  menusCount: number;
  permissionsCount: number;
  encapsulationStatus: 'PASS' | 'WARN';
  healthScore: number; // 0 - 100
}

/**
 * Dynamically scan and discover all test suite files in `tests/` and `src/modules/`
 */
export function discoverAllTestSuites(cwd = process.cwd()): DynamicTestSuite[] {
  const testFiles: { fullPath: string; relPath: string; category: string }[] = [];

  function scanDir(dir: string, baseDir: string, category = 'General') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          scanDir(full, baseDir, entry.name);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
        testFiles.push({
          fullPath: full,
          relPath: path.relative(baseDir, full),
          category,
        });
      }
    }
  }

  scanDir(path.join(cwd, 'tests'), cwd, 'System');
  scanDir(path.join(cwd, 'src', 'modules'), cwd, 'Module');

  // Sort files nicely
  testFiles.sort((a, b) => a.relPath.localeCompare(b.relPath));

  return testFiles.map((tf, index) => {
    let name = path.basename(tf.relPath, '.ts').replace(/\.test$/, '').replace(/[-_]/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    let description = `ชุดทดสอบอัตโนมัติสำหรับ ${name}`;

    try {
      const content = fs.readFileSync(tf.fullPath, 'utf8').slice(0, 1000);
      const titleMatch = content.match(/---\s*Running\s+(.*?)\s*---/i) || content.match(/\/\*\*\s*([\s\S]*?)\*\//);
      if (titleMatch && titleMatch[1]) {
        const cleanTitle = titleMatch[1].replace(/[*#]/g, '').trim().split('\n')[0];
        if (cleanTitle.length > 5) {
          name = cleanTitle;
          description = `ชุดทดสอบ ${cleanTitle}`;
        }
      }
    } catch {
      // ignore
    }

    const id = String(index + 1).padStart(2, '0');

    return {
      id,
      name,
      file: tf.relPath,
      category: tf.category,
      description,
      status: 'PASS',
    };
  });
}

/**
 * Dynamically inspect all modules in the codebase (both registered and filesystem-discovered)
 */
export async function auditAllModules(cwd = process.cwd()): Promise<{
  modules: DynamicModuleAudit[];
  stats: {
    total: number;
    enabled: number;
    core: number;
    custom: number;
    encapsulationPassed: number;
    averageHealth: number;
  };
}> {
  const modulesDir = path.join(cwd, 'src', 'modules');
  const discoveredFolderIds: string[] = [];

  if (fs.existsSync(modulesDir)) {
    const entries = fs.readdirSync(modulesDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && e.name !== 'core') {
        discoveredFolderIds.push(e.name);
      }
    }
  }

  // Get all registered module manifests
  const allManifests = ModuleRegistry.getAllModules();
  const manifestMap = new Map<string, any>();
  for (const m of allManifests) {
    manifestMap.set(m.id, m);
  }

  // Union of registered manifests and physical folders
  const allModuleIds = Array.from(new Set([...discoveredFolderIds, ...manifestMap.keys()]));

  // Query enabled settings
  let enabledModuleIds: string[] = [];
  try {
    const isPostgres = process.env.DATABASE_URL?.includes('postgres');
    if (isPostgres) {
      const rows = await (prisma as any).appSetting.findMany({
        where: { key: { startsWith: 'module_enabled_' } },
      });
      enabledModuleIds = rows.filter((r: any) => r.value === 'true' || r.value === true).map((r: any) => r.key.replace('module_enabled_', ''));
    } else {
      const rows = await (prisma as any).setting.findMany({
        where: { key: { startsWith: 'module_enabled_' } },
      });
      enabledModuleIds = rows.filter((r: any) => r.value === 'true' || r.value === true).map((r: any) => r.key.replace('module_enabled_', ''));
    }
  } catch {
    // fallback
  }

  const results: DynamicModuleAudit[] = [];

  for (const modId of allModuleIds) {
    const modFolder = path.join(modulesDir, modId);
    const hasFolder = fs.existsSync(modFolder);
    const hasManifest = hasFolder && fs.existsSync(path.join(modFolder, 'manifest.ts'));
    const hasIndex = hasFolder && (fs.existsSync(path.join(modFolder, 'index.ts')) || fs.existsSync(path.join(modFolder, 'index.tsx')));
    const hasViews = hasFolder && fs.existsSync(path.join(modFolder, 'views'));
    const hasLib = hasFolder && fs.existsSync(path.join(modFolder, 'lib'));
    const hasSchema = hasFolder && fs.existsSync(path.join(modFolder, 'schema.prisma'));

    const manifest = manifestMap.get(modId);
    const apiMap = ModuleApiRegistry.get(modId);
    const apiEndpointsCount = apiMap ? Object.keys(apiMap).length : 0;
    const hasApi = apiEndpointsCount > 0 || (hasFolder && fs.existsSync(path.join(modFolder, 'api.ts')));

    const isCore = manifest?.isCore ?? false;
    const isEnabled = isCore || (manifest?.defaultEnabled ?? true) || enabledModuleIds.includes(modId);

    // Calculate encapsulation & health
    let healthScore = 50;
    if (hasManifest) healthScore += 10;
    if (hasIndex) healthScore += 10;
    if (hasViews) healthScore += 10;
    if (hasApi) healthScore += 10;
    if (hasLib || !hasFolder) healthScore += 10;

    const encapsulationStatus = (hasFolder && hasManifest && hasIndex) || isCore ? 'PASS' : 'WARN';

    results.push({
      id: modId,
      name: manifest?.name || modId,
      nameEn: manifest?.nameEn || modId,
      category: manifest?.category || 'custom',
      version: manifest?.version || '1.0.0',
      isCore,
      isEnabled,
      hasManifest,
      hasIndex,
      hasViews,
      hasLib,
      hasSchema,
      hasApi,
      apiEndpointsCount,
      menusCount: manifest?.menus?.length || 0,
      permissionsCount: manifest?.permissions?.length || 0,
      encapsulationStatus,
      healthScore: Math.min(100, healthScore),
    });
  }

  // Sort: core first, then by id
  results.sort((a, b) => {
    if (a.isCore && !b.isCore) return -1;
    if (!a.isCore && b.isCore) return 1;
    return a.id.localeCompare(b.id);
  });

  const total = results.length;
  const enabled = results.filter(r => r.isEnabled).length;
  const core = results.filter(r => r.isCore).length;
  const custom = total - core;
  const encapsulationPassed = results.filter(r => r.encapsulationStatus === 'PASS').length;
  const avgHealth = Math.round(results.reduce((acc, r) => acc + r.healthScore, 0) / (total || 1));

  return {
    modules: results,
    stats: {
      total,
      enabled,
      core,
      custom,
      encapsulationPassed,
      averageHealth: avgHealth,
    },
  };
}

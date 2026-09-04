import fs from 'fs';
import path from 'path';
import { ALL_SYSTEM_MODULES } from '@/lib/modules/registry';

export interface DiscoveredRoute {
  path: string;
  name: string;
  category: 'Core' | 'Personnel' | 'Management' | 'Settings' | 'Auth' | 'Public' | 'Other';
  sourceFile: string;
  isDynamic: boolean;
  dynamicParams?: string[];
}

/**
 * Dynamically discovers all active page routes from system modules and app router
 */
export function scanProjectPageRoutes(baseDir?: string, includeDynamic = false): DiscoveredRoute[] {
  const discovered: DiscoveredRoute[] = [];

  // Core & Default system routes
  const staticRoutes: { path: string; name: string; category: DiscoveredRoute['category'] }[] = [
    { path: '/dashboard', name: 'หน้าหลัก (Dashboard)', category: 'Core' },
    { path: '/login', name: 'เข้าสู่ระบบ (Login)', category: 'Auth' },
  ];

  staticRoutes.forEach(r => {
    discovered.push({
      path: r.path,
      name: r.name,
      category: r.category,
      sourceFile: 'src/app/page.tsx',
      isDynamic: false,
    });
  });

  // Extract active modular routes from ALL_SYSTEM_MODULES
  ALL_SYSTEM_MODULES.forEach(mod => {
    mod.menus.forEach(menu => {
      if (menu.path && !discovered.some(d => d.path === menu.path)) {
        discovered.push({
          path: menu.path,
          name: `${menu.title} (${mod.name})`,
          category: mod.category === 'core' ? 'Core' : 'Management',
          sourceFile: `src/modules/${mod.id}`,
          isDynamic: false,
        });
      }
      if (menu.subItems) {
        menu.subItems.forEach(sub => {
          if (sub.path && !discovered.some(d => d.path === sub.path)) {
            discovered.push({
              path: sub.path,
              name: `${sub.name} (${mod.name})`,
              category: 'Management',
              sourceFile: `src/modules/${mod.id}`,
              isDynamic: false,
            });
          }
        });
      }
    });

    if (mod.settingsPath && !discovered.some(d => d.path === mod.settingsPath)) {
      discovered.push({
        path: mod.settingsPath,
        name: `ตั้งค่า ${mod.name}`,
        category: 'Settings',
        sourceFile: `src/modules/${mod.id}`,
        isDynamic: false,
      });
    }
  });

  // Also walk physical app dir for non-module standalone pages
  const appDir = baseDir || path.join(process.cwd(), 'src', 'app');
  if (fs.existsSync(appDir)) {
    try {
      const walk = (currentDir: string) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === 'api' || entry.name === 'modules') continue;
            walk(fullPath);
          } else if (entry.isFile() && /^page\.(tsx|jsx|js|ts)$/.test(entry.name)) {
            const relativeToApp = path.relative(appDir, currentDir);
            const segments = relativeToApp
              .split(path.sep)
              .filter(segment => segment && !segment.startsWith('(') && !segment.endsWith(')'));

            let routePath = '/' + segments.join('/');
            if (routePath === '//' || routePath === '') routePath = '/';

            const isDynamic = /\[.*?\]/.test(routePath);
            if (!isDynamic && !discovered.some(d => d.path === routePath)) {
              discovered.push({
                path: routePath,
                name: routePath,
                category: 'Public',
                sourceFile: path.relative(process.cwd(), fullPath),
                isDynamic: false,
              });
            }
          }
        }
      };
      walk(appDir);
    } catch {}
  }

  // Sort logically: Core -> Personnel -> Management -> Settings -> Auth -> Public
  const categoryOrder: Record<string, number> = {
    Core: 1,
    Personnel: 2,
    Management: 3,
    Settings: 4,
    Auth: 5,
    Public: 6,
    Other: 7,
  };

  return discovered.sort((a, b) => {
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.path.localeCompare(b.path);
  });
}


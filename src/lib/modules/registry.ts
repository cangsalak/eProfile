import { ModuleManifest, ModuleMenu } from './types';
import { Personnel } from '@/types/personnel';

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

import { PersonnelManifest } from '@/modules/personnel/manifest';
import { LeavesManifest } from '@/modules/leaves/manifest';
import { VehiclesManifest } from '@/modules/vehicles/manifest';
import { BadgesManifest } from '@/modules/badges/manifest';
import { CalendarManifest } from '@/modules/calendar/manifest';
import { NewsManifest } from '@/modules/news/manifest';
import { ContactsManifest } from '@/modules/contacts/manifest';
import { CommandDashboardManifest } from '@/modules/command-dashboard/manifest';
import { SystemInspectorManifest } from '@/modules/system-inspector/manifest';
import { MenusManifest } from '@/modules/menus/manifest';
import { themeManifest } from '@/modules/theme/manifest';
import { backupManifest } from '@/modules/backup/manifest';
import { ModuleManagerManifest } from '@/modules/module-manager/manifest';

export const ALL_SYSTEM_MODULES: ModuleManifest[] = [
  PersonnelManifest,
  LeavesManifest,
  VehiclesManifest,
  BadgesManifest,
  CalendarManifest,
  NewsManifest,
  ContactsManifest,
  CommandDashboardManifest,
  SystemInspectorManifest,
  MenusManifest,
  themeManifest,
  backupManifest,
  ModuleManagerManifest,
];

export class ModuleRegistry {
  /**
   * Get all registered modules in the system (Built-in + Custom)
   */
  static getAllModules(customModules: ModuleManifest[] = []): ModuleManifest[] {
    const list = [...ALL_SYSTEM_MODULES];
    for (const custom of customModules) {
      if (!list.some((m) => m.id === custom.id)) {
        list.push(custom);
      }
    }
    return list;
  }

  /**
   * Get modules that are currently enabled based on settings
   */
  static getEnabledModules(enabledModuleIds: string[], customModules: ModuleManifest[] = []): ModuleManifest[] {
    return this.getAllModules(customModules).filter((m) => m.isCore || enabledModuleIds.includes(m.id));
  }

  /**
   * Check if a specific module is enabled
   */
  static isModuleEnabled(moduleId: string, enabledModuleIds: string[], customModules: ModuleManifest[] = []): boolean {
    const mod = this.getAllModules(customModules).find((m) => m.id === moduleId);
    if (!mod) return false;
    if (mod.isCore) return true;
    return enabledModuleIds.includes(moduleId);
  }

  /**
   * Generate dynamic sidebar navigation menus based on enabled modules and user permissions
   */
  static getNavigationMenus(
    user: Personnel | null,
    enabledModuleIds: string[],
    customModules: ModuleManifest[] = [],
    menuOverrides: MenuOverride[] = []
  ): { name: string; icon: string; path: string; subItems?: { name: string; path: string }[] }[] {
    if (!user) return [];

    const enabledModules = this.getEnabledModules(enabledModuleIds, customModules);
    const userPerms = user.permissions || [];
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isLeadership = ['HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER'].includes(user.role || '');

    // Core Dashboard item (always present when logged in)
    const allMenus: { name: string; icon: string; path: string; order: number; subItems?: { name: string; path: string }[] }[] = [
      {
        name: 'หน้าหลัก (Dashboard)',
        icon: 'fa-solid fa-chart-pie',
        path: '/dashboard',
        order: 10,
      },
    ];

    enabledModules.forEach((mod) => {
      mod.menus.forEach((menu) => {
        const override = menuOverrides.find((item) => item.id === menu.id);
        if (override?.enabled === false) return;
        const menuTitle = override?.title?.trim() || menu.title;
        const menuPath = override?.path?.trim() || menu.path;
        const menuOrder = override?.order ?? menu.order;
        const menuIcon = override?.icon?.trim() || menu.icon;

        // Check Role Requirement
        let hasRole = true;
        if (menu.requiredRoles && menu.requiredRoles.length > 0) {
          hasRole = user.role ? menu.requiredRoles.includes(user.role) : false;
        }

        // Check Permission Requirement with leadership role compatibility
        let hasPerm = true;
        if (menu.requiredPermission && !isAdmin) {
          if (menu.id === 'command-dashboard-view' && isLeadership) {
            hasPerm = true;
          } else if (menu.id === 'manage-leave-approvals' && isLeadership) {
            hasPerm = true;
          } else {
            hasPerm = userPerms.includes(menu.requiredPermission);
          }
        }

        if (hasRole && hasPerm) {
          const rawSubItems = override?.subItems || menu.subItems;
          const subItems = rawSubItems
            ? rawSubItems
                .filter((sub) => !sub.requiredPermission || isAdmin || userPerms.includes(sub.requiredPermission))
                .map((sub) => ({ name: sub.name, path: sub.path }))
            : undefined;

          allMenus.push({
            name: menuTitle,
            icon: menuIcon,
            path: menuPath,
            order: menuOrder,
            subItems,
          });
        }
      });
    });

    // Add Custom Menus created by Admin
    menuOverrides.forEach((override) => {
      if (override.isCustom && override.enabled !== false && override.title && override.path) {
        if (!allMenus.some((m) => m.path === override.path)) {
          let hasRole = true;
          if (override.requiredRoles && override.requiredRoles.length > 0) {
            hasRole = user.role ? override.requiredRoles.includes(user.role) : false;
          }
          let hasPerm = true;
          if (override.requiredPermission && !isAdmin) {
            hasPerm = userPerms.includes(override.requiredPermission);
          }

          if (hasRole && hasPerm) {
            const subItems = override.subItems
              ? override.subItems
                  .filter((sub) => !sub.requiredPermission || isAdmin || userPerms.includes(sub.requiredPermission))
                  .map((sub) => ({ name: sub.name, path: sub.path }))
              : undefined;

            allMenus.push({
              name: override.title.trim(),
              icon: override.icon || 'fa-solid fa-link',
              path: override.path.trim(),
              order: override.order ?? 500,
              subItems,
            });
          }
        }
      }
    });


    // Deduplicate menus by path to prevent duplicate sidebar entries
    const uniqueMenus: typeof allMenus = [];
    const seenPaths = new Set<string>();

    allMenus
      .sort((a, b) => a.order - b.order)
      .forEach((menu) => {
        if (!seenPaths.has(menu.path)) {
          seenPaths.add(menu.path);
          uniqueMenus.push(menu);
        }
      });

    return uniqueMenus.map(({ name, icon, path, subItems }) => ({ name, icon, path, subItems }));
  }

  /**
   * Extract all permissions defined across all enabled modules
   */
  static getAllModulePermissions(enabledModuleIds: string[], customModules: ModuleManifest[] = []) {
    const enabledModules = this.getEnabledModules(enabledModuleIds, customModules);
    const permissions: { key: string; name: string; description: string; moduleName: string }[] = [];

    enabledModules.forEach((m) => {
      m.permissions.forEach((p) => {
        permissions.push({
          ...p,
          moduleName: m.name,
        });
      });
    });

    return permissions;
  }

  /**
   * Get dynamic legacy redirect mapping from all modules.
   * Helps migrate old hardcoded next.config.js redirects to module-level definitions.
   */
  static getLegacyRedirect(pathname: string): string | null {
    for (const mod of ALL_SYSTEM_MODULES) {
      if (!mod.legacyRoutes) continue;
      
      for (const [source, dest] of Object.entries(mod.legacyRoutes)) {
        // Exact match
        if (source === pathname) {
          return dest;
        }
        
        // Simple param match (e.g. /verify/:id)
        if (source.includes(':')) {
          const sourceRegex = new RegExp('^' + source.replace(/:[a-zA-Z0-9_]+/g, '([^/]+)') + '$');
          const match = pathname.match(sourceRegex);
          if (match) {
            let finalDest = dest;
            const paramNames = source.match(/:[a-zA-Z0-9_]+/g) || [];
            paramNames.forEach((p, i) => {
              finalDest = finalDest.replace(p, match[i + 1]);
            });
            return finalDest;
          }
        }
      }
    }
    return null;
  }
}

import { ModuleManifest, ModuleMenu } from './types';
import { Personnel } from '@/modules/users';

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
  isSetting?: boolean;
  subItems?: { name: string; path: string; requiredPermission?: string }[];
}

import { GENERATED_MANIFESTS, GENERATED_MANIFEST_EXPORTS } from './generated-manifests';
import { SettingsManifest } from './manifest';

export const ALL_SYSTEM_MODULES: ModuleManifest[] = [
  SettingsManifest,
  ...GENERATED_MANIFESTS,
];

export const { UsersManifest, PersonnelManifest, RolesManifest, SiteManifest, SiteContentManifest, InspectorManifest, SystemInspectorManifest, AuthManifest, InstallManifest, PrintManifest } = GENERATED_MANIFEST_EXPORTS;
export { SettingsManifest };

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
  ): { name: string; icon: string; path: string; group?: string; subItems?: { name: string; path: string }[] }[] {
    if (!user) return [];

    const enabledModules = this.getEnabledModules(enabledModuleIds, customModules);
    const userPerms = user.permissions || [];
    const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isLeadership = ['HR_MANAGER', 'DEPARTMENT_COMMANDER', 'COMMANDER'].includes(user.role || '');

    // All menu items are sourced from module manifests — no hardcoded items here
    const allMenus: { name: string; icon: string; path: string; order: number; group?: string; subItems?: { name: string; path: string }[] }[] = [];

    enabledModules.forEach((mod) => {
      mod.menus.forEach((menu) => {
        const override = menuOverrides.find((item) => item.id === menu.id);
        if (override?.enabled === false) return;
        if (override?.isSetting ?? menu.isSetting) return;
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
          if ((menu.id === 'dashboard-command' || menu.id === 'command-dashboard-view') && isLeadership) {
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
            group: menu.group || 'personal',
            subItems,
          });
        }
      });
    });

    // Add Custom Menus created by Admin
    menuOverrides.forEach((override) => {
      if (override.isCustom && override.enabled !== false && !override.isSetting && override.title && override.path) {
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
              group: 'system',
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
   * Dynamically get all settings cards from registered modules
   */
  static getSettingsCards(customModules: ModuleManifest[] = []): { href: string; icon: string; title: string; description: string; moduleId: string; isCore: boolean }[] {
    const modules = this.getAllModules(customModules);
    const cards: { href: string; icon: string; title: string; description: string; moduleId: string; isCore: boolean }[] = [];

    for (const mod of modules) {
      if (mod.settingsPath) {
        cards.push({
          moduleId: mod.id,
          href: mod.settingsPath,
          icon: mod.icon,
          title: mod.name,
          description: mod.description,
          isCore: mod.isCore,
        });
      }
    }
    return cards;
  }

  /**
   * Dynamically resolve legacy or alias ?tab=... parameter on the /settings page
   */
  static resolveSettingsTab(tab?: string, customModules: ModuleManifest[] = []): string | null {
    if (!tab) return null;
    const cleanTab = tab.toLowerCase().trim();
    const modules = this.getAllModules(customModules);

    // Direct match by module id
    const matchedMod = modules.find((m) => m.id === cleanTab);
    if (matchedMod?.settingsPath) return matchedMod.settingsPath;

    // Common legacy aliases
    const legacyAliases: Record<string, string> = {
      system: '/modules/theme',
      theme: '/modules/theme',
      badge: '/modules/badges/settings',
      badges: '/modules/badges/settings',
      roles: '/modules/roles',
      role: '/modules/roles',
      dropdowns: '/modules/inspector/categories',
      categories: '/modules/inspector/categories',
      departments: '/modules/users/departments',
      department: '/modules/users/departments',
      notifications: '/modules/news/settings',
      notification: '/modules/news/settings',
      line: '/modules/news/settings',
      mail: '/modules/news/settings',
      modules: '/modules/module-manager',
      module: '/modules/module-manager',
      menus: '/modules/module-manager/menus',
      menu: '/modules/module-manager/menus',
      maintenance: '/modules/backup',
      backup: '/modules/backup',
      content: '/modules/site',
      site: '/modules/site',
      apidocs: '/modules/api-docs',
      'api-docs': '/modules/api-docs',
      inspector: '/modules/inspector',
    };

    if (legacyAliases[cleanTab]) {
      return legacyAliases[cleanTab];
    }

    return null;
  }

  /**
   * Get dynamic legacy redirect mapping from all modules.
   */
  static getLegacyRedirect(pathname: string, customModules: ModuleManifest[] = []): string | null {
    const modules = this.getAllModules(customModules);
    for (const mod of modules) {
      if (!mod.legacyRoutes) continue;
      
      for (const [source, dest] of Object.entries(mod.legacyRoutes)) {
        if (source === pathname) {
          return dest;
        }
        
        if (source.includes(':') || source.includes('*')) {
          const paramNames: string[] = [];
          const regexStr = '^' + source
            .replace(/:([a-zA-Z0-9_]+)\*/g, (_, p) => {
              paramNames.push(':' + p + '*');
              return '(.*)';
            })
            .replace(/:([a-zA-Z0-9_]+)/g, (_, p) => {
              paramNames.push(':' + p);
              return '([^/]+)';
            }) + '$';

          const sourceRegex = new RegExp(regexStr);
          const match = pathname.match(sourceRegex);
          if (match) {
            let finalDest = dest;
            paramNames.forEach((p, i) => {
              const matchedVal = match[i + 1] || '';
              finalDest = finalDest.replace(p, matchedVal);
            });
            finalDest = finalDest.replace(/([^:])\/{2,}/g, '$1/');
            return finalDest;
          }
        }
      }
    }
    return null;
  }

  /**
   * Get dynamic API rewrite mapping from all modules.
   */
  static getApiRewrite(pathname: string, customModules: ModuleManifest[] = []): string | null {
    const modules = this.getAllModules(customModules);
    for (const mod of modules) {
      if (!mod.apiRewrites) continue;
      
      for (const [source, dest] of Object.entries(mod.apiRewrites)) {
        if (source === pathname) {
          return dest;
        }
        
        if (source.includes(':') || source.includes('*')) {
          const paramNames: string[] = [];
          const regexStr = '^' + source
            .replace(/:([a-zA-Z0-9_]+)\*/g, (_, p) => {
              paramNames.push(':' + p + '*');
              return '(.*)';
            })
            .replace(/:([a-zA-Z0-9_]+)/g, (_, p) => {
              paramNames.push(':' + p);
              return '([^/]+)';
            }) + '$';

          const sourceRegex = new RegExp(regexStr);
          const match = pathname.match(sourceRegex);
          if (match) {
            let finalDest = dest;
            paramNames.forEach((p, i) => {
              const matchedVal = match[i + 1] || '';
              finalDest = finalDest.replace(p, matchedVal);
            });
            finalDest = finalDest.replace(/([^:])\/{2,}/g, '$1/');
            return finalDest;
          }
        }
      }
    }
    return null;
  }
}


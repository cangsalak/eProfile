export type ModuleCategory = 'core' | 'hr' | 'operations' | 'tools' | 'system';

export interface ModuleMenu {
  id: string;
  title: string;
  icon: string;
  path: string;
  requiredPermission?: string;
  requiredRoles?: string[];
  subItems?: { name: string; path: string; requiredPermission?: string }[];
  order: number;
}

export interface ModulePermission {
  key: string;
  name: string;
  description: string;
}

export interface ModuleManifest {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: ModuleCategory;
  isCore: boolean;
  defaultEnabled: boolean;
  menus: ModuleMenu[];
  permissions: ModulePermission[];
  settingsPath?: string;
  legacyRoutes?: Record<string, string>;
}

export interface ModuleDefinition {
  manifest: ModuleManifest;
  views: Record<string, React.ComponentType<any>>;
}

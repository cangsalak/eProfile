export type ModuleCategory = 'core' | 'hr' | 'operations' | 'tools' | 'system';

export interface ModuleMenu {
  id: string;
  title: string;
  icon: string;
  path: string;
  requiredPermission?: string;
  requiredRoles?: string[];
  subItems?: { name: string; path: string; requiredPermission?: string }[];
  isSetting?: boolean;
  order: number;
  group?: 'personal' | 'operations' | 'system';
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
  apiRewrites?: Record<string, string>;
  scripts?: {
    install?: string;
    uninstall?: string;
    update?: string;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type ApiRouteHandler = (
  req: Request,
  context: { params: Record<string, string | string[]> }
) => Promise<Response> | Response;

export type ModuleApiRouteMap = Record<
  string,
  Partial<Record<HttpMethod, ApiRouteHandler>>
>;

export interface ModuleDefinition {
  manifest: ModuleManifest;
  views: Record<string, React.ComponentType<any>>;
  api?: ModuleApiRouteMap;
}

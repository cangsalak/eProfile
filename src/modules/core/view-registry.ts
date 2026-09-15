import { ModuleDefinition } from './types';

import { UsersModule, PersonnelModule } from '@/modules/users';
import { RolesModule } from '@/modules/roles';
import { LeavesModule } from '@/modules/leaves';
import { BadgesModule } from '@/modules/badges';
import { CalendarModule } from '@/modules/calendar';
import { NewsModule } from '@/modules/news';
import { ContactsModule } from '@/modules/contacts';
import { DashboardModule } from '@/modules/dashboard';
import { InspectorModule, SystemInspectorModule } from '@/modules/inspector';
import { ThemeModule } from '@/modules/theme';
import { BackupModule } from '@/modules/backup';
import { ModuleManagerModule } from '@/modules/module-manager';
import { SiteModule, SiteContentModule } from '@/modules/site';
import { TestSlipModule } from '@/modules/test-slip';
import { Rpb1Module } from '@/modules/rpb1';
import { ApiDocsModule } from '@/modules/api-docs';
import { UploadModule } from '@/modules/upload';
import { AuthModule } from '@/modules/auth';
import { InstallModule, InstallManifest } from '@/modules/install';
import { SettingsManifest } from './manifest';
import SettingsView from './views/SettingsView';

export const SettingsModule: ModuleDefinition = {
  manifest: SettingsManifest,
  views: {
    '': SettingsView,
    'settings': SettingsView,
  },
};

export const BUILTIN_MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  'settings': SettingsModule,
  'install': InstallModule,
  'dashboard': DashboardModule,
  'command-dashboard': DashboardModule,
  'auth': AuthModule,
  'personnel': UsersModule,
  'users': UsersModule,
  'roles': RolesModule,
  'leaves': LeavesModule,
  'badges': BadgesModule,
  'calendar': CalendarModule,
  'news': NewsModule,
  'contacts': ContactsModule,
  'upload': UploadModule,
  'system-inspector': InspectorModule,
  'inspector': InspectorModule,
  'api-docs': ApiDocsModule,
  'theme': ThemeModule,
  'backup': BackupModule,
  'module-manager': ModuleManagerModule,
  'site': SiteModule,
  'site-content': SiteModule,
  'test-slip': TestSlipModule,
  'rpb1': Rpb1Module,
};

export { UsersModule, PersonnelModule, RolesModule, SiteModule, SiteContentModule, InspectorModule, SystemInspectorModule, AuthModule };

export class ModuleViewRegistry {
  private static customDefinitions: Map<string, ModuleDefinition> = new Map();

  /**
   * Register a module definition dynamically with its views
   */
  static register(definition: ModuleDefinition): void {
    this.customDefinitions.set(definition.manifest.id, definition);
  }

  /**
   * Get a module definition by ID (Built-in or Custom)
   */
  static get(moduleId: string): ModuleDefinition | undefined {
    return BUILTIN_MODULE_DEFINITIONS[moduleId] || this.customDefinitions.get(moduleId);
  }

  /**
   * Get all registered module definitions
   */
  static getAll(): ModuleDefinition[] {
    const list = Object.values(BUILTIN_MODULE_DEFINITIONS);
    for (const [id, def] of this.customDefinitions.entries()) {
      if (!list.some((m) => m.manifest.id === id)) {
        list.push(def);
      }
    }
    return list;
  }
}

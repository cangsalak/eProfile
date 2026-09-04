import { ModuleDefinition } from './types';

import { PersonnelModule } from '@/modules/personnel';
import { LeavesModule } from '@/modules/leaves';
import { VehiclesModule } from '@/modules/vehicles';
import { BadgesModule } from '@/modules/badges';
import { CalendarModule } from '@/modules/calendar';
import { NewsModule } from '@/modules/news';
import { ContactsModule } from '@/modules/contacts';
import { CommandDashboardModule } from '@/modules/command-dashboard';
import { SystemInspectorModule } from '@/modules/system-inspector';
import { MenusModule } from '@/modules/menus';
import { ThemeModule } from '@/modules/theme';
import { BackupModule } from '@/modules/backup';
import { ModuleManagerModule } from '@/modules/module-manager';

export const BUILTIN_MODULE_DEFINITIONS: Record<string, ModuleDefinition> = {
  'personnel': PersonnelModule,
  'leaves': LeavesModule,
  'vehicles': VehiclesModule,
  'badges': BadgesModule,
  'calendar': CalendarModule,
  'news': NewsModule,
  'contacts': ContactsModule,
  'command-dashboard': CommandDashboardModule,
  'system-inspector': SystemInspectorModule,
  'menus': MenusModule,
  'theme': ThemeModule,
  'backup': BackupModule,
  'module-manager': ModuleManagerModule,
};

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

import { ModuleDefinition } from './types';

import { GENERATED_MODULE_ARRAY, GENERATED_MODULE_EXPORTS } from './generated-views';
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
};

// Map generated modules by their manifest ID
for (const rawMod of GENERATED_MODULE_ARRAY) {
  const mod = rawMod as any;
  if (mod && mod.manifest && mod.manifest.id) {
    BUILTIN_MODULE_DEFINITIONS[mod.manifest.id] = mod;
  }
}

export const { UsersModule, PersonnelModule, RolesModule, SiteModule, SiteContentModule, InspectorModule, SystemInspectorModule, AuthModule, PrintModule } = GENERATED_MODULE_EXPORTS as any;

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

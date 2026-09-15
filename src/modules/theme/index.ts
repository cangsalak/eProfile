import { ModuleDefinition } from '@/modules/core/types';
import { themeManifest } from './manifest';
import ThemeSettingsView from './views/ThemeSettingsView';

export * from './manifest';
export * from './lib/theme-manager';
export { default as ThemeSettingsView } from './views/ThemeSettingsView';

export const ThemeModule: ModuleDefinition = {
  manifest: themeManifest,
  views: {
    '': ThemeSettingsView,
  },
};

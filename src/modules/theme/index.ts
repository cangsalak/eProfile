import { ModuleDefinition } from '@/lib/modules/types';
import { themeManifest } from './manifest';
import ThemeSettingsView from './views/ThemeSettingsView';

export * from './manifest';
export { default as ThemeSettingsView } from './views/ThemeSettingsView';
export * from './views/ThemeSettingsView';

export const ThemeModule: ModuleDefinition = {
  manifest: themeManifest,
  views: {
    '': ThemeSettingsView,
  },
};

import { ModuleDefinition } from '@/modules/core/types';
import { ModuleManagerManifest } from './manifest';
import ManageModulesView from './views/ManageModulesView';
import ManageMenusView from './views/ManageMenusView';

export * from './manifest';
export { default as ManageModulesView } from './views/ManageModulesView';
export { default as ManageMenusView } from './views/ManageMenusView';
export { default as ModuleManagerSettings } from './components/ModuleManagerSettings';
export { default as MenuCustomizer } from './components/MenuCustomizer';

export const ModuleManagerModule: ModuleDefinition = {
  manifest: ModuleManagerManifest,
  views: {
    '': ManageModulesView,
    'index': ManageModulesView,
    'manage': ManageModulesView,
    'modules': ManageModulesView,
    'menus': ManageMenusView,
  },
};

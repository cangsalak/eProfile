import { ModuleDefinition } from '@/lib/modules/types';
import { ModuleManagerManifest } from './manifest';
import ManageModulesView from './views/ManageModulesView';

export * from './manifest';
export { default as ManageModulesView } from './views/ManageModulesView';

export const ModuleManagerModule: ModuleDefinition = {
  manifest: ModuleManagerManifest,
  views: {
    '': ManageModulesView,
    'index': ManageModulesView,
    'manage': ManageModulesView,
  },
};

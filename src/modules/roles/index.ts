import { ModuleDefinition } from '@/modules/core/types';
import { RolesManifest } from './manifest';
import RolesView from './views/RolesView';
import RoleSettings from './components/RoleSettings';

export * from './manifest';
export * from './lib/role-definitions';
export { default as RolesView } from './views/RolesView';
export { default as RoleSettings } from './components/RoleSettings';

export const RolesModule: ModuleDefinition = {
  manifest: RolesManifest,
  views: {
    '': RolesView,
    'settings': RolesView,
  },
};

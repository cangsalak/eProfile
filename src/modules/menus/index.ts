import { ModuleDefinition } from '@/lib/modules/types';
import { MenusManifest } from './manifest';
import MenuManagerView from './views/MenuManagerView';

export * from './manifest';
export { default as MenuManagerView } from './views/MenuManagerView';
export * from './views/MenuManagerView';

export const MenusModule: ModuleDefinition = {
  manifest: MenusManifest,
  views: {
    '': MenuManagerView,
    'manager': MenuManagerView,
  },
};

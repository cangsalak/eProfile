import { ModuleDefinition } from '@/modules/core/types';
import { SiteManifest } from './manifest';
import SiteView from './views/SiteView';

export * from './manifest';
export { default as SiteView } from './views/SiteView';
export * from './views/SiteView';

export const SiteModule: ModuleDefinition = {
  manifest: SiteManifest,
  views: {
    '': SiteView,
    'manage': SiteView,
    'home': SiteView,
    'about': SiteView,
    'contact': SiteView,
    'services': SiteView,
  },
};

// Backward compatibility alias
export const SiteContentModule = SiteModule;
export const SiteContentView = SiteView;

import { ModuleDefinition } from '@/lib/modules/types';
import { SiteContentManifest } from './manifest';
import SiteContentView from './views/SiteContentView';

export * from './manifest';
export { default as SiteContentView } from './views/SiteContentView';
export * from './views/SiteContentView';

export const SiteContentModule: ModuleDefinition = {
  manifest: SiteContentManifest,
  views: {
    '': SiteContentView,
  },
};

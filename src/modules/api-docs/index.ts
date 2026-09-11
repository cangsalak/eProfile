import { ModuleDefinition } from '@/lib/modules/types';
import { ApiDocsManifest } from './manifest';
import ApiDocsView from './views/ApiDocsView';
import ApiTokensView from './views/ApiTokensView';

export * from './manifest';
export * from './lib/code-generator';
export { default as ApiDocsView } from './views/ApiDocsView';
export { default as ApiTokensView } from './views/ApiTokensView';

export const ApiDocsModule: ModuleDefinition = {
  manifest: ApiDocsManifest,
  views: {
    '': ApiDocsView,
    'docs': ApiDocsView,
    'tokens': ApiTokensView,
  },
};

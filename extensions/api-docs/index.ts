import { ModuleDefinition } from '@/modules/core/types';
import { ApiDocsManifest } from './manifest';
import ApiDocsView from './views/ApiDocsView';
import ApiTokensView from './views/ApiTokensView';
import ApiDocsWidget from './widgets/ApiDocsWidget';


export * from './manifest';
export * from './lib/code-generator';
export { default as ApiDocsView } from './views/ApiDocsView';
export { default as ApiTokensView } from './views/ApiTokensView';
export { default as ApiDocsWidget } from './widgets/ApiDocsWidget';

export const ApiDocsModule: ModuleDefinition = {
  manifest: ApiDocsManifest,
  views: {
    '': ApiDocsView,
    'docs': ApiDocsView,
    'tokens': ApiTokensView,
  },
  widgets: {
    'api-docs-widget': ApiDocsWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

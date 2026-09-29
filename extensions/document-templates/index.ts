import { ModuleDefinition } from '@/modules/core/types';
import { manifest } from './manifest';
import DocumentTemplateDashboard from './views/DocumentTemplateDashboard';
import DocumentTemplatesWidget from './widgets/DocumentTemplatesWidget';


export * from './manifest';
export { default as DocumentTemplateDashboard } from './views/DocumentTemplateDashboard';
export { default as DocumentTemplatesWidget } from './widgets/DocumentTemplatesWidget';

export const documentTemplatesModule: ModuleDefinition = {
  manifest,
  views: {
    '': DocumentTemplateDashboard,
    'dashboard': DocumentTemplateDashboard,
    'templates': DocumentTemplateDashboard,
  },
  widgets: {
    'document-templates-widget': DocumentTemplatesWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

export default documentTemplatesModule;

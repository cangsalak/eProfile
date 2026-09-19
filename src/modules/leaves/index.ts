import { ModuleDefinition } from '@/modules/core/types';
import { LeavesManifest } from './manifest';
import LeaveDashboardView from './views/LeaveDashboardView';
import DocumentTemplateDashboard from '@/modules/document-templates/views/DocumentTemplateDashboard';
export * from './manifest';
export { default as LeaveDashboardView } from './views/LeaveDashboardView';
export const LeavesModule: ModuleDefinition = {
  manifest: LeavesManifest,
  views: {
    '': LeaveDashboardView,
    'dashboard': LeaveDashboardView,
    'templates': DocumentTemplateDashboard,
  },
};


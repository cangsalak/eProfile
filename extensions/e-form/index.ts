import { ModuleDefinition } from '@/modules/core/types';
import { EFormManifest } from './manifest';
import LeaveDashboardView from './views/LeaveDashboardView';
import DocumentTemplateDashboard from '@/modules/document-templates/views/DocumentTemplateDashboard';
import EFormQuickStats from './widgets/EFormQuickStats';
export * from './manifest';
export { default as LeaveDashboardView } from './views/LeaveDashboardView';
export const EFormModule: ModuleDefinition = {
  manifest: EFormManifest,
  views: {
    '': LeaveDashboardView,
    'dashboard': LeaveDashboardView,
    'templates': DocumentTemplateDashboard,
  },
  widgets: {
    'eform-quick-stats': EFormQuickStats
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};


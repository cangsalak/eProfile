import { ModuleDefinition } from '@/lib/modules/types';
import { DashboardManifest } from './manifest';
import DashboardView from './views/DashboardView';
import CommandDashboardView from './views/CommandDashboardView';

export * from './manifest';
export { default as DashboardView } from './views/DashboardView';
export * from './views/DashboardView';
export { default as CommandDashboardView } from './views/CommandDashboardView';
export * from './views/CommandDashboardView';

export const DashboardModule: ModuleDefinition = {
  manifest: DashboardManifest,
  views: {
    '': DashboardView,
    'overview': DashboardView,
    'command': CommandDashboardView,
  },
};

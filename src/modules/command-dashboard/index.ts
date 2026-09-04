import { ModuleDefinition } from '@/lib/modules/types';
import { CommandDashboardManifest } from './manifest';
import CommandDashboardView from './views/CommandDashboardView';

export * from './manifest';
export { default as CommandDashboardView } from './views/CommandDashboardView';
export * from './views/CommandDashboardView';

export const CommandDashboardModule: ModuleDefinition = {
  manifest: CommandDashboardManifest,
  views: {
    '': CommandDashboardView,
  },
};

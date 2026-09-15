import { ModuleDefinition } from '@/modules/core/types';
import { LeavesManifest } from './manifest';
import LeaveDashboardView from './views/LeaveDashboardView';
import LeaveApprovalsView from './views/LeaveApprovalsView';

export * from './manifest';
export { default as LeaveApprovalsView } from './views/LeaveApprovalsView';
export { default as LeaveDashboardView } from './views/LeaveDashboardView';

export const LeavesModule: ModuleDefinition = {
  manifest: LeavesManifest,
  views: {
    '': LeaveDashboardView,
    'dashboard': LeaveDashboardView,
    'approvals': LeaveApprovalsView,
  },
};


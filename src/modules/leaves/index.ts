import { ModuleDefinition } from '@/lib/modules/types';
import { LeavesManifest } from './manifest';
import LeaveDashboardView from './views/LeaveDashboardView';
import LeaveApprovalsView from './views/LeaveApprovalsView';
import LeavePrintView from './views/LeavePrintView';

export * from './manifest';
export { default as LeaveApprovalsView } from './views/LeaveApprovalsView';
export { default as LeaveDashboardView } from './views/LeaveDashboardView';
export { default as LeavePrintView } from './views/LeavePrintView';
export * from './views/LeaveApprovalsView';
export * from './views/LeaveDashboardView';
export * from './views/LeavePrintView';

export const LeavesModule: ModuleDefinition = {
  manifest: LeavesManifest,
  views: {
    '': LeaveDashboardView,
    'approvals': LeaveApprovalsView,
    'print': LeavePrintView,
  },
};

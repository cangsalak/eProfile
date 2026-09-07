import { ModuleDefinition } from '@/lib/modules/types';
import { TestSlipManifest } from './manifest';
import PaySlipView from './views/PaySlipView';
import ManageSlipView from './views/ManageSlipView';

export * from './manifest';
export { default as PaySlipView } from './views/PaySlipView';
export { default as ManageSlipView } from './views/ManageSlipView';

export const TestSlipModule: ModuleDefinition = {
  manifest: TestSlipManifest,
  views: {
    '': PaySlipView,
    'index': PaySlipView,
    'manage': ManageSlipView,
  },
};

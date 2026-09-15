import PrintManifest from './manifest';
import PrintCenterView from './views/PrintCenterView';
import { ModuleDefinition } from '@/modules/core/types';

export const PrintModule: ModuleDefinition = {
  manifest: PrintManifest,
  views: {
    '': PrintCenterView,
    'center': PrintCenterView,
  },
};

export { PrintManifest, PrintCenterView };
export default PrintModule;

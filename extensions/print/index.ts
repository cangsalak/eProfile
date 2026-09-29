import { ModuleDefinition } from '@/modules/core/types';
import PrintManifest from './manifest';
import PrintCenterView from './views/PrintCenterView';
import PrintSettingsView from './views/PrintSettingsView';
import PrintQuickHubWidget from './widgets/PrintQuickHubWidget';
import PrintPreviewModal from './components/PrintPreviewModal';
import A4PrintLayout from './components/A4PrintLayout';

export * from './types';
export * from './manifest';
export {
  PrintPreviewModal,
  A4PrintLayout,
  PrintCenterView,
  PrintSettingsView,
  PrintQuickHubWidget,
};

export const PrintModule: ModuleDefinition = {
  manifest: PrintManifest,
  views: {
    '': PrintCenterView,
    'index': PrintCenterView,
    'center': PrintCenterView,
    'settings': PrintSettingsView,
  },
  widgets: {
    'print-quick-hub': PrintQuickHubWidget,
  },
};

export default PrintModule;

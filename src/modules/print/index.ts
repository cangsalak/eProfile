import PrintManifest from './manifest';
import PrintCenterView from './views/PrintCenterView';
import DocumentPrintSection from './components/DocumentPrintSection';
import BadgePrintSection from './components/BadgePrintSection';
import BarcodeQrPrintSection from './components/BarcodeQrPrintSection';
import CertificatePrintSection from './components/CertificatePrintSection';
import PrintSettingsToolbar from './components/PrintSettingsToolbar';
import PrintPreviewModal from './components/PrintPreviewModal';
import { ModuleDefinition } from '@/modules/core/types';

export * from './types';
export * from './manifest';
export {
  PrintCenterView,
  DocumentPrintSection,
  BadgePrintSection,
  BarcodeQrPrintSection,
  CertificatePrintSection,
  PrintSettingsToolbar,
  PrintPreviewModal,
};

export const PrintModule: ModuleDefinition = {
  manifest: PrintManifest,
  views: {
    '': PrintCenterView,
    'center': PrintCenterView,
  },
};

export default PrintModule;

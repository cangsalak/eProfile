import PrintManifest from './manifest';
import PrintPreviewModal from './components/PrintPreviewModal';
import A4PrintLayout from './components/A4PrintLayout';
import { ModuleDefinition } from '@/modules/core/types';

export * from './types';
export * from './manifest';
export { PrintPreviewModal, A4PrintLayout };

export const PrintModule: ModuleDefinition = {
  manifest: PrintManifest,
  views: {},
};

export default PrintModule;

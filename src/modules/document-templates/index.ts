import { ModuleDefinition } from '@/modules/core/types';
import { manifest } from './manifest';
import DocumentTemplateDashboard from './views/DocumentTemplateDashboard';

export const documentTemplatesModule: ModuleDefinition = {
  manifest,
  views: {
    'dashboard': DocumentTemplateDashboard,
  },
};

export default documentTemplatesModule;

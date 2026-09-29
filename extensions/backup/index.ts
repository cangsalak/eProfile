import { ModuleDefinition } from '@/modules/core/types';
import { backupManifest } from './manifest';
import BackupSettingsView from './views/BackupSettingsView';
import BackupQuickWidget from './widgets/BackupQuickWidget';


export * from './manifest';
export * from './lib/backup-validation';
export { default as BackupSettingsView } from './views/BackupSettingsView';
export { default as BackupQuickWidget } from './widgets/BackupQuickWidget';

export const BackupModule: ModuleDefinition = {
  manifest: backupManifest,
  views: {
    '': BackupSettingsView,
  },
  widgets: {
    'backup-quick-widget': BackupQuickWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

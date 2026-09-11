import { ModuleDefinition } from '@/lib/modules/types';
import { backupManifest } from './manifest';
import BackupSettingsView from './views/BackupSettingsView';

export * from './manifest';
export * from './lib/backup-validation';
export { default as BackupSettingsView } from './views/BackupSettingsView';
export * from './views/BackupSettingsView';

export const BackupModule: ModuleDefinition = {
  manifest: backupManifest,
  views: {
    '': BackupSettingsView,
  },
};

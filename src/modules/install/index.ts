/**
 * Install Module
 *
 * Handles all system installation logic:
 *  - Database connection testing (db-test.ts)
 *  - Installer seed data (sample-data.ts)
 *  - Install wizard API handlers
 *  - Install Wizard View
 */

import { ModuleDefinition } from '@/modules/core/types';
import { InstallManifest } from './manifest';
import InstallView from './views/InstallView';

export * from './manifest';
export { default as InstallView } from './views/InstallView';

export const InstallModule: ModuleDefinition = {
  manifest: InstallManifest,
  views: {
    '': InstallView,
    'install': InstallView,
  },
};


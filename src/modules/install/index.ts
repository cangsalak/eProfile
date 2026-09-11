/**
 * Install Module
 *
 * Handles all system installation logic:
 *  - Database connection testing (db-test.ts)
 *  - Installer seed data (sample-data.ts)
 *  - Install wizard API handlers
 */

export * from './lib/db-test';
export * from './lib/sample-data';
export { POST as handleInstall } from './api/install-handler';
export { POST as handleTestDb } from './api/test-db-handler';

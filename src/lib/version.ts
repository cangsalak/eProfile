/**
 * Central application version.
 * Keep this value synchronized with package.json.
 */
export const APP_VERSION = '1.3.0';
export const APP_NAME = 'eProfile System';
export const VERSION_LABEL = `v${APP_VERSION}`;

export const BUILD_INFO = {
  name: APP_NAME,
  version: APP_VERSION,
  label: VERSION_LABEL,
  environment: process.env.NODE_ENV ?? 'development',
} as const;

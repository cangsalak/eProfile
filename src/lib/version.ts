/**
 * Central application version — sourced from package.json at build time.
 * Update ONLY package.json version; this file syncs automatically.
 */
import packageJson from '../../package.json';

export const APP_VERSION: string = packageJson.version;
export const APP_NAME: string    = 'eProfile System';
export const VERSION_LABEL       = `v${APP_VERSION}`;

// Build-time git commit hash (injected via next.config.js env)
export const GIT_COMMIT: string =
  process.env.NEXT_PUBLIC_GIT_COMMIT ?? 'unknown';

export const BUILD_INFO = {
  name:        APP_NAME,
  version:     APP_VERSION,
  label:       VERSION_LABEL,
  gitCommit:   GIT_COMMIT,
  environment: process.env.NODE_ENV ?? 'development',
  builtAt:     process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString(),
} as const;

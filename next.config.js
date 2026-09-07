/** @type {import('next').NextConfig} */
const { execSync } = require('child_process');

// Capture build-time metadata
let gitCommit = 'unknown';
let gitBranch = 'unknown';
try {
  gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch {
  // Not a git repo or git not available
}
const buildTime = new Date().toISOString();

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Inject build-time info as public env vars
  env: {
    NEXT_PUBLIC_GIT_COMMIT: gitCommit,
    NEXT_PUBLIC_GIT_BRANCH: gitBranch,
    NEXT_PUBLIC_BUILD_TIME: buildTime,
  },
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://kit.fontawesome.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com https://cdnjs.cloudflare.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self'",
      "frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control',    value: 'on' },
          { key: 'Strict-Transport-Security',  value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'X-Frame-Options',            value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(self), microphone=(), geolocation=(), fullscreen=(self "https://www.google.com" "https://maps.google.com")' },
          { key: 'Content-Security-Policy',    value: cspDirectives },
        ]
      }
    ];
  },

  /**
   * Clean URL rewrites — maps clean URLs (e.g. /inspector, /site-content, /leaves) to internal /modules/...
   */
  async rewrites() {
    return [
      // ── Personnel ──────────────────────────────────────────
      { source: '/personnel',             destination: '/modules/personnel/directory' },
      { source: '/personnel/directory',   destination: '/modules/personnel/directory' },
      { source: '/personnel/manage',      destination: '/modules/personnel/manage' },
      { source: '/personnel/roles',       destination: '/modules/personnel/roles' },
      { source: '/personnel/profile',     destination: '/modules/personnel/profile' },
      { source: '/personnel/:id',         destination: '/modules/personnel/:id' },

      // ── Leaves ─────────────────────────────────────────────
      { source: '/leaves',                destination: '/modules/leaves' },
      { source: '/leaves/approvals',      destination: '/modules/leaves/approvals' },
      { source: '/leaves/:path*',         destination: '/modules/leaves/:path*' },

      // ── Vehicles ───────────────────────────────────────────
      { source: '/vehicles',              destination: '/modules/vehicles' },
      { source: '/vehicles/:path*',       destination: '/modules/vehicles/:path*' },

      // ── Badges ─────────────────────────────────────────────
      { source: '/badges',                destination: '/modules/badges' },
      { source: '/badges/:path*',         destination: '/modules/badges/:path*' },

      // ── Calendar ───────────────────────────────────────────
      { source: '/calendar',              destination: '/modules/calendar' },
      { source: '/calendar/duty',         destination: '/modules/calendar/duty' },
      { source: '/calendar/settings',     destination: '/modules/calendar/settings' },
      { source: '/calendar/:path*',       destination: '/modules/calendar/:path*' },

      // ── News / Communications ──────────────────────────────
      { source: '/news-inbox',            destination: '/modules/news' },
      { source: '/news/settings',         destination: '/modules/news/settings' },
      { source: '/news/:path*',           destination: '/modules/news/:path*' },

      // ── Contacts ───────────────────────────────────────────
      { source: '/contacts',              destination: '/modules/contacts' },
      { source: '/contacts/:path*',       destination: '/modules/contacts/:path*' },

      // ── Command Dashboard ──────────────────────────────────
      { source: '/command-dashboard',     destination: '/modules/command-dashboard' },
      { source: '/command-dashboard/:path*', destination: '/modules/command-dashboard/:path*' },

      // ── System Inspector (clean admin URLs) ────────────────
      { source: '/inspector',             destination: '/modules/system-inspector' },
      { source: '/inspector/api-docs',    destination: '/modules/system-inspector/api-docs' },
      { source: '/inspector/audit-logs',  destination: '/modules/system-inspector/audit-logs' },
      { source: '/inspector/categories',  destination: '/modules/system-inspector/categories' },
      { source: '/inspector/modules',     destination: '/modules/system-inspector/modules' },
      { source: '/inspector/:path*',      destination: '/modules/system-inspector/:path*' },

      // ── Menus Manager ──────────────────────────────────────
      { source: '/menus',                 destination: '/modules/menus' },
      { source: '/menus/:path*',          destination: '/modules/menus/:path*' },

      // ── Theme ──────────────────────────────────────────────
      { source: '/theme',                 destination: '/modules/theme' },
      { source: '/theme/:path*',          destination: '/modules/theme/:path*' },

      // ── Backup ─────────────────────────────────────────────
      { source: '/backup',                destination: '/modules/backup' },
      { source: '/backup/:path*',         destination: '/modules/backup/:path*' },

      // ── Module Manager ─────────────────────────────────────
      { source: '/module-manager',        destination: '/modules/module-manager' },
      { source: '/module-manager/:path*', destination: '/modules/module-manager/:path*' },

      // ── Site Content (CMS) ─────────────────────────────────
      { source: '/site-content',          destination: '/modules/site-content' },
      { source: '/site-content/:path*',   destination: '/modules/site-content/:path*' },

      // ── Test Slip (Pay Slip) ───────────────────────────────
      { source: '/test-slip',             destination: '/modules/test-slip' },
      { source: '/test-slip/:path*',      destination: '/modules/test-slip/:path*' },
    ];
  },
};

module.exports = nextConfig;

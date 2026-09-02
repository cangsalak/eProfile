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
          { key: 'Permissions-Policy',         value: 'camera=(self), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy',    value: cspDirectives },
        ]
      }
    ];
  },
};

module.exports = nextConfig;

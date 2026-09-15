import { prisma } from './prisma';

/**
 * Production-safe logger utility.
 * In production, errors are still logged (they go to PM2/system logs).
 * Debug/info logs are suppressed in production to avoid leaking sensitive data.
 */

const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isProd) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (!isProd) console.log('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (message: string, error?: unknown) => {
    // Always log errors, but sanitize in production
    if (isProd) {
      console.error(`[ERROR] ${message}`);
    } else {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};

export async function logSecurityEvent(data: {
  action: string;
  userId?: string;
  endpoint?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action: data.action,
        personnelId: data.userId || null,
        entity: 'SecurityAudit',
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress || null,
      },
    });
  } catch (err) {
    logger.error('Failed to write security audit log', err);
  }
}

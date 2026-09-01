import { prisma } from './prisma';

/**
 * Extracts client IP address from HTTP Request headers
 * Supports Reverse Proxies (Nginx, Cloudflare, AWS ALB) and direct local connections
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Standard Audit Log Creator
 * Automatically attaches Client IP Address and stringifies JSON details
 */
export async function createAuditLog({
  req,
  personnelId,
  action,
  entity,
  entityId,
  details,
}: {
  req?: Request;
  personnelId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | Record<string, any> | null;
}) {
  try {
    const ipAddress = req ? getClientIp(req) : '127.0.0.1';
    const detailStr = typeof details === 'object' && details !== null ? JSON.stringify(details) : (details || null);

    return await prisma.auditLog.create({
      data: {
        personnelId: personnelId || null,
        action,
        entity,
        entityId: entityId || null,
        details: detailStr,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

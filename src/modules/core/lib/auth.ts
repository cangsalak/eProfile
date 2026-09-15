import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-jwt-default-secret-change-in-production-at-least-32-bytes';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function verifyAuth(req?: Request) {
  try {
    let token: string | undefined;

    try {
      const cookieStore = cookies();
      token = cookieStore.get('auth_token')?.value;
    } catch {
      // In cases where cookies() is unavailable
    }

    if (!token && req) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        }
      }

      if (!token) {
        const apiKeyHeader = req.headers.get('x-api-key');
        if (apiKeyHeader) {
          token = apiKeyHeader.trim();
        }
      }
    }

    if (!token) return null;

    // Check if token is a Static/Scoped API Key (ep_live_...)
    if (token.startsWith('ep_live_')) {
      const { verifyApiKey } = await import('@/modules/api-docs/lib/api-keys');
      const apiKeyResult = await verifyApiKey(token);
      if (apiKeyResult.valid && apiKeyResult.user) {
        return apiKeyResult.user;
      }
      return null;
    }

    // Default: Verify standard JWT Token
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as { id: string; role: string; username: string };
  } catch {
    return null;
  }
}

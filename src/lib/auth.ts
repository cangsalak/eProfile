import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
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
          token = authHeader.substring(7);
        }
      }
    }

    if (!token) return null;

    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as { id: string; role: string; username: string };
  } catch {
    return null;
  }
}

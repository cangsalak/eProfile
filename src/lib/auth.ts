import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function verifyAuth(req?: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as { id: string, role: string, username: string };
  } catch (error) {
    return null;
  }
}

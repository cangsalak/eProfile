import { NextResponse } from 'next/server';
import { handleGetRpb1List } from '@/modules/users/api/rpb1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleGetRpb1List(request);
}

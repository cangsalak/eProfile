import { NextResponse } from 'next/server';
import { handleGetRpb1ByPersonnelId, handleSaveRpb1ByPersonnelId } from '@/modules/users/api/rpb1';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  return handleGetRpb1ByPersonnelId(request, context as any);
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  return handleSaveRpb1ByPersonnelId(request, context as any);
}

import { NextResponse } from 'next/server';
import { GET as slugGET, POST as slugPOST, PUT as slugPUT, PATCH as slugPATCH, DELETE as slugDELETE, HEAD as slugHEAD, OPTIONS as slugOPTIONS } from '../[...slug]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  return slugGET(request, { params: { slug: [context.params.id] } });
}

export async function POST(request: Request, context: { params: { id: string } }) {
  return slugPOST(request, { params: { slug: [context.params.id] } });
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  return slugPUT(request, { params: { slug: [context.params.id] } });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  return slugPATCH(request, { params: { slug: [context.params.id] } });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  return slugDELETE(request, { params: { slug: [context.params.id] } });
}

export async function HEAD(request: Request, context: { params: { id: string } }) {
  return slugHEAD(request, { params: { slug: [context.params.id] } });
}

export async function OPTIONS(request: Request, context: { params: { id: string } }) {
  return slugOPTIONS(request, { params: { slug: [context.params.id] } });
}

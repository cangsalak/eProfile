import { prisma, requireAuth, requirePermission } from '@/modules/core';
import { NextRequest, NextResponse } from 'next/server';

export async function handleCategoriesApi(req: NextRequest, context: { params: Record<string, string | string[]> }) {
  const { method } = req;
  if (method === 'GET') {
    const { error: authError } = await requireAuth(req as any);
    if (authError) return authError;
  } else {
    const { error: permError } = await requirePermission(req as any, 'MANAGE_SYSTEM');
    if (permError) return permError;
  }

  const id = context.params?.id as string;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          const category = await prisma.documentCategory.findUnique({ where: { id } });
          return NextResponse.json({ success: true, data: category });
        }
        const categories = await prisma.documentCategory.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { templates: true } } }
        });
        return NextResponse.json({ success: true, data: categories });

      case 'POST':
        const createBody = await req.json();
        const newCategory = await prisma.documentCategory.create({
          data: {
            name: createBody.name,
            code: createBody.code,
            description: createBody.description,
          },
        });
        return NextResponse.json({ success: true, data: newCategory });

      case 'PUT':
        const updateBody = await req.json();
        const updatedCategory = await prisma.documentCategory.update({
          where: { id },
          data: {
            name: updateBody.name,
            code: updateBody.code,
            description: updateBody.description,
          },
        });
        return NextResponse.json({ success: true, data: updatedCategory });

      case 'DELETE':
        await prisma.documentCategory.delete({ where: { id } });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (error: any) {
    console.error('Category API Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}

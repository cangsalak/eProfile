import { prisma, requireAuth, requirePermission } from '@/modules/core';
import { NextRequest, NextResponse } from 'next/server';

export async function handleTemplatesApi(req: NextRequest, context: { params: Record<string, string | string[]> }) {
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
        const searchParams = req.nextUrl.searchParams;
        const categoryId = searchParams.get('categoryId');
        const categoryCode = searchParams.get('categoryCode');
        const code = searchParams.get('code');

        let where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (categoryCode) {
          where.category = {
            code: {
              in: [categoryCode, categoryCode.toLowerCase(), categoryCode.toUpperCase()]
            }
          };
        }
        if (code) where.code = code;

        if (id) {
          const template = await prisma.documentTemplate.findUnique({ where: { id } });
          return NextResponse.json({ success: true, data: template });
        }
        
        const templates = await prisma.documentTemplate.findMany({
          where,
          orderBy: { name: 'asc' },
          include: { category: { select: { name: true, code: true } } }
        });
        return NextResponse.json({ success: true, data: templates });

      case 'POST':
        const createBody = await req.json();
        if (!createBody.code || !createBody.name || !createBody.categoryId) {
          return NextResponse.json({ error: 'กรุณาระบุหมวดหมู่ ชื่อ และรหัสแม่แบบให้ครบถ้วน' }, { status: 400 });
        }
        const existingCode = await prisma.documentTemplate.findFirst({
          where: { categoryId: createBody.categoryId, code: createBody.code }
        });
        if (existingCode) {
          return NextResponse.json({ error: `รหัสแม่แบบ "${createBody.code}" มีอยู่ในหมวดหมู่นี้แล้ว กรุณาระบุรหัสอื่น หรือแก้ไขของเดิม` }, { status: 400 });
        }

        const newTemplate = await prisma.documentTemplate.create({
          data: {
            categoryId: createBody.categoryId,
            name: createBody.name,
            code: createBody.code,
            pdfUrl: createBody.pdfUrl,
            docxUrl: createBody.docxUrl,
            isActive: createBody.isActive ?? true,
            mappingJson: createBody.mappingJson,
          },
        });
        return NextResponse.json({ success: true, data: newTemplate });

      case 'PUT':
        const updateBody = await req.json();
        if (updateBody.code) {
          const duplicate = await prisma.documentTemplate.findFirst({
            where: { code: updateBody.code, NOT: { id } }
          });
          if (duplicate) {
            return NextResponse.json({ error: `รหัสแม่แบบ "${updateBody.code}" ซ้ำกับแม่แบบอื่นในระบบ` }, { status: 400 });
          }
        }

        const updatedTemplate = await prisma.documentTemplate.update({
          where: { id },
          data: {
            categoryId: updateBody.categoryId,
            name: updateBody.name,
            code: updateBody.code,
            pdfUrl: updateBody.pdfUrl,
            docxUrl: updateBody.docxUrl,
            isActive: updateBody.isActive,
            mappingJson: updateBody.mappingJson,
          },
        });
        return NextResponse.json({ success: true, data: updatedTemplate });

      case 'DELETE':
        await prisma.documentTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (error: any) {
    console.error('Template API Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}

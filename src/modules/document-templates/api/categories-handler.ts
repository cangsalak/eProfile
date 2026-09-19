import { prisma, requireAuth, requireRole } from '@/modules/core';
import { NextRequest, NextResponse } from 'next/server';

export async function handleCategoriesApi(req: NextRequest, context: { params: Record<string, string | string[]> }) {
  const { method } = req;
  if (method === 'GET') {
    const { error: authError } = await requireAuth(req as any);
    if (authError) return authError;
  } else {
    const { error: roleError } = await requireRole(req as any, ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER']);
    if (roleError) return roleError;
  }

  const id = context.params?.id as string;

  try {
    switch (method) {
      case 'GET':
        if (id) {
          const category = await prisma.documentCategory.findUnique({
            where: { id },
            include: { _count: { select: { templates: true } } }
          });
          return NextResponse.json({ success: true, data: category });
        }
        const categories = await prisma.documentCategory.findMany({
          orderBy: { name: 'asc' },
          include: { _count: { select: { templates: true } } }
        });
        return NextResponse.json({ success: true, data: categories });

      case 'POST': {
        const createBody = await req.json();

        if (createBody.action === 'seed_defaults') {
          const { seedDocumentCategories } = await import('@/modules/leaves/lib/seed-categories');
          const { count } = await seedDocumentCategories(prisma as any);
          const allCategories = await prisma.documentCategory.findMany({
            orderBy: { code: 'asc' },
            include: { _count: { select: { templates: true } } }
          });
          return NextResponse.json({ 
            success: true, 
            message: `นำเข้า/กู้คืนหมวดหมู่มาตรฐานเรียบร้อย (${count} หมวดหมู่)`,
            data: allCategories 
          });
        }

        const name = createBody.name?.trim();
        const code = createBody.code?.trim()?.toUpperCase();
        const description = createBody.description?.trim() || null;

        if (!name || !code) {
          return NextResponse.json({ error: 'กรุณาระบุชื่อและรหัสหมวดหมู่ให้ครบถ้วน' }, { status: 400 });
        }

        const existingCategory = await prisma.documentCategory.findUnique({
          where: { code }
        });
        if (existingCategory) {
          return NextResponse.json({ error: `รหัสหมวดหมู่ "${code}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น` }, { status: 400 });
        }

        const newCategory = await prisma.documentCategory.create({
          data: {
            name,
            code,
            description,
          },
        });
        return NextResponse.json({ success: true, data: newCategory });
      }

      case 'PUT': {
        if (!id) {
          return NextResponse.json({ error: 'ไม่พบ ID หมวดหมู่ที่ต้องการแก้ไข' }, { status: 400 });
        }
        const updateBody = await req.json();
        const name = updateBody.name?.trim();
        const code = updateBody.code?.trim()?.toUpperCase();
        const description = updateBody.description?.trim() || null;

        if (!name || !code) {
          return NextResponse.json({ error: 'กรุณาระบุชื่อและรหัสหมวดหมู่ให้ครบถ้วน' }, { status: 400 });
        }

        const duplicateCode = await prisma.documentCategory.findFirst({
          where: {
            code,
            id: { not: id }
          }
        });
        if (duplicateCode) {
          return NextResponse.json({ error: `รหัสหมวดหมู่ "${code}" ถูกใช้งานโดยหมวดหมู่อื่นแล้ว` }, { status: 400 });
        }

        const updatedCategory = await prisma.documentCategory.update({
          where: { id },
          data: {
            name,
            code,
            description,
          },
        });
        return NextResponse.json({ success: true, data: updatedCategory });
      }

      case 'DELETE': {
        if (!id) {
          return NextResponse.json({ error: 'ไม่พบ ID หมวดหมู่ที่ต้องการลบ' }, { status: 400 });
        }
        const templateCount = await prisma.documentTemplate.count({
          where: { categoryId: id }
        });
        if (templateCount > 0) {
          return NextResponse.json({
            error: `ไม่สามารถลบหมวดหมู่นี้ได้ เนื่องจากมีแม่แบบเอกสาร ${templateCount} รายการสังกัดอยู่ กรุณาย้ายหรือลบแม่แบบก่อน`
          }, { status: 400 });
        }

        await prisma.documentCategory.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  } catch (error: any) {
    console.error('Category API Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}

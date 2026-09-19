import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export interface DefaultCategoryItem {
  code: string;
  name: string;
  description?: string;
}

export async function seedDocumentCategories(prismaClient?: PrismaClient) {
  const prisma = prismaClient || new PrismaClient();
  const jsonPath = path.resolve(__dirname, '../data/document-categories.json');

  let categories: DefaultCategoryItem[] = [];
  if (fs.existsSync(jsonPath)) {
    categories = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    // Fallback path in case of bundler directory resolution
    const altPath = path.resolve(process.cwd(), 'src/modules/leaves/data/document-categories.json');
    if (fs.existsSync(altPath)) {
      categories = JSON.parse(fs.readFileSync(altPath, 'utf8'));
    }
  }

  if (categories.length === 0) {
    console.warn('⚠️ No document categories found to seed.');
    return { count: 0, results: [] };
  }

  const results = [];
  for (const cat of categories) {
    const upserted = await prisma.documentCategory.upsert({
      where: { code: cat.code },
      update: {
        name: cat.name,
        description: cat.description || null,
      },
      create: {
        code: cat.code,
        name: cat.name,
        description: cat.description || null,
      },
    });
    results.push(upserted);
  }

  // Ensure default Starter Leave Template exists under category '100' (กพ.)
  const cat100 = results.find((c) => c.code === '100');
  if (cat100) {
    const existingLeaveTemplate = await prisma.documentTemplate.findFirst({
      where: {
        categoryId: cat100.id,
        code: '100',
      },
    });

    if (!existingLeaveTemplate) {
      await prisma.documentTemplate.create({
        data: {
          categoryId: cat100.id,
          name: 'ลากิจ (ทบ. 100-006)',
          code: '100',
          docxUrl: '/templates/docx/starter_leave_template.docx',
          isActive: true,
        },
      });
    }
  }

  return { count: results.length, results };
}

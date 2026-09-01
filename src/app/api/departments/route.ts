import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อหน่วยงาน' }, { status: 400 });
    }

    let subDepartmentsJson = '[]';
    if (Array.isArray(body.subDepartments)) {
      subDepartmentsJson = JSON.stringify(body.subDepartments);
    } else if (typeof body.subDepartments === 'string') {
      subDepartmentsJson = body.subDepartments;
    }

    const department = await prisma.department.create({
      data: {
        name: body.name.trim(),
        shortName: body.shortName ? body.shortName.trim() : '',
        subDepartments: subDepartmentsJson,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      },
    });
    return NextResponse.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

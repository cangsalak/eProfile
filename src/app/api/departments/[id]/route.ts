import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อหน่วยงาน' }, { status: 400 });
    }

    let subDepartmentsJson = undefined;
    if (Array.isArray(body.subDepartments)) {
      subDepartmentsJson = JSON.stringify(body.subDepartments);
    } else if (typeof body.subDepartments === 'string') {
      subDepartmentsJson = body.subDepartments;
    }

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        ...(body.shortName !== undefined && { shortName: body.shortName ? body.shortName.trim() : '' }),
        ...(subDepartmentsJson !== undefined && { subDepartments: subDepartmentsJson }),
        ...(typeof body.sortOrder === 'number' && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    await prisma.department.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}

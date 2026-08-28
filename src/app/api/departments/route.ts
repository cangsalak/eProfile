import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const department = await prisma.department.create({
      data: { name: body.name },
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

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '@/lib/auth-guards';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const roles = await prisma.systemRole.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Fetch roles error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error: authError } = await requirePermission(req, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const data = await req.json();
    
    if (!data.name || !data.displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedName = data.name.toUpperCase().replace(/\s+/g, '_');

    const existingRole = await prisma.systemRole.findUnique({
      where: { name: normalizedName }
    });

    if (existingRole) {
      return NextResponse.json({ error: 'ชื่ออ้างอิง Role นี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    const role = await prisma.systemRole.create({
      data: {
        name: normalizedName,
        displayName: data.displayName,
        description: data.description || '',
        permissions: JSON.stringify(data.permissions || []),
        isSystem: false
      }
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

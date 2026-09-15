import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';

export async function handleGetRoles() {
  try {
    const roles = await prisma.systemRole.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function handleCreateRole(req: Request) {
  try {
    const { error: authError } = await requirePermission(req, 'MANAGE_ROLES');
    if (authError) return authError;

    const data = await req.json();
    if (!data.name || !data.displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedName = data.name.toUpperCase().replace(/\s+/g, '_');
    const existingRole = await prisma.systemRole.findUnique({
      where: { name: normalizedName },
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
        isSystem: false,
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function handleUpdateRole(
  req: Request,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const { error: authError } = await requirePermission(req, 'MANAGE_ROLES');
    if (authError) return authError;

    const id = context.params.id as string;
    const data = await req.json();

    const role = await prisma.systemRole.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updated = await prisma.systemRole.update({
      where: { id },
      data: {
        displayName: data.displayName ?? role.displayName,
        description: data.description ?? role.description,
        permissions: data.permissions ? JSON.stringify(data.permissions) : role.permissions,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function handleDeleteRole(
  req: Request,
  context: { params: Record<string, string | string[]> }
) {
  try {
    const { error: authError } = await requirePermission(req, 'MANAGE_ROLES');
    if (authError) return authError;

    const id = context.params.id as string;
    const role = await prisma.systemRole.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system role' }, { status: 400 });
    }

    await prisma.systemRole.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

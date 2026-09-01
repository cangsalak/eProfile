import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requirePermission } from '@/lib/auth-guards';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_SYSTEM');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    // Check if system role
    const existingRole = await prisma.systemRole.findUnique({
      where: { id: params.id }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.isSystem) {
      // System roles can only update permissions, not name
      const role = await prisma.systemRole.update({
        where: { id: params.id },
        data: {
          permissions: JSON.stringify(data.permissions || []),
          displayName: data.displayName || existingRole.displayName,
          description: data.description || existingRole.description,
        }
      });
      await prisma.auditLog.create({
        data: { personnelId: user.id, action: 'ROLE_CHANGED', entity: 'SystemRole', entityId: role.id, details: `Updated permissions for ${role.name}` }
      });
      return NextResponse.json(role);
    } else {
      const normalizedName = data.name ? data.name.toUpperCase().replace(/\s+/g, '_') : existingRole.name;
      
      const role = await prisma.systemRole.update({
        where: { id: params.id },
        data: {
          name: normalizedName,
          displayName: data.displayName,
          description: data.description,
          permissions: JSON.stringify(data.permissions || [])
        }
      });
      await prisma.auditLog.create({
        data: { personnelId: user.id, action: 'ROLE_CHANGED', entity: 'SystemRole', entityId: role.id, details: `Updated role ${role.name}` }
      });
      return NextResponse.json(role);
    }
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error: authError } = await requirePermission(req, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const existingRole = await prisma.systemRole.findUnique({
      where: { id: params.id }
    });

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (existingRole.isSystem) {
      return NextResponse.json({ error: 'ไม่สามารถลบสิทธิ์พื้นฐานของระบบได้' }, { status: 400 });
    }

    // Check if role is in use
    const usersWithRole = await prisma.personnel.count({
      where: { role: existingRole.name }
    });

    if (usersWithRole > 0) {
      return NextResponse.json({ error: `ไม่สามารถลบได้ เนื่องจากมีผู้ใช้งานใช้สิทธิ์นี้อยู่จำนวน ${usersWithRole} คน` }, { status: 400 });
    }

    await prisma.systemRole.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

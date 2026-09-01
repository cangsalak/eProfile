import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
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

    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Must be own vehicle or have MANAGE_SYSTEM / MANAGE_PERSONNEL permission / SUPER_ADMIN
    if (vehicle.personnelId !== authUser.id && authUser.role !== 'SUPER_ADMIN') {
      const { error: permError } = await requirePermission(request, 'MANAGE_SYSTEM');
      if (permError) return permError;
    }

    const body = await request.json();

    const updated = await prisma.vehicle.update({
      where: { id: params.id },
      data: {
        type: body.type !== undefined ? body.type : vehicle.type,
        licensePlate: body.licensePlate !== undefined ? body.licensePlate : vehicle.licensePlate,
        brand: body.brand !== undefined ? body.brand : vehicle.brand,
        model: body.model !== undefined ? body.model : vehicle.model,
        color: body.color !== undefined ? body.color : vehicle.color,
        photoFront: body.photoFront !== undefined ? body.photoFront : vehicle.photoFront,
        photoBack: body.photoBack !== undefined ? body.photoBack : vehicle.photoBack,
        photoSide: body.photoSide !== undefined ? body.photoSide : vehicle.photoSide,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
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

    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Must be own vehicle or have MANAGE_SYSTEM permission / SUPER_ADMIN
    if (vehicle.personnelId !== authUser.id && authUser.role !== 'SUPER_ADMIN') {
      const { error: permError } = await requirePermission(request, 'MANAGE_SYSTEM');
      if (permError) return permError;
    }

    await prisma.vehicle.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}

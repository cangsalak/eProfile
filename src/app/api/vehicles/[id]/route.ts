import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await prisma.vehicle.update({
      where: { id: params.id },
      data: body,
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
    const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
    if (vehicle) {
      await prisma.vehicle.delete({
        where: { id: params.id },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}

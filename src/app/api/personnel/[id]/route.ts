import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendLineNotify } from '../../../../lib/notifications';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check if updating password
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password; // Don't overwrite if empty
    }

    if (Array.isArray(body.skills)) {
      body.skills = JSON.stringify(body.skills);
    }

    // Remove fields that shouldn't be updated directly or are relations
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;
    delete body.vehicles;

    const updated = await prisma.personnel.update({
      where: { id: params.id },
      data: body,
    });
    
    await sendLineNotify(`✏️ มีการแก้ไขข้อมูลบุคลากร: ${updated.prefix}${updated.firstName} ${updated.lastName}`);
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating personnel:', error);
    return NextResponse.json({ error: 'Failed to update personnel' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const person = await prisma.personnel.findUnique({ where: { id: params.id } });
    if (person) {
      await prisma.personnel.delete({
        where: { id: params.id },
      });
      await sendLineNotify(`🗑️ ข้อมูลบุคลากรถูกลบออกจากระบบ: ${person.prefix}${person.firstName} ${person.lastName}`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return NextResponse.json({ error: 'Failed to delete personnel' }, { status: 500 });
  }
}

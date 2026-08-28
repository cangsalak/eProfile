import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/vehicles?personnelId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personnelId = searchParams.get('personnelId');

    if (!personnelId) {
      return NextResponse.json({ error: 'personnelId is required' }, { status: 400 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { personnelId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch vehicles' }, { status: 500 });
  }
}

// POST /api/vehicles
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personnelId, type, licensePlate, brand, model, color, photoFront, photoBack, photoSide } = body;

    if (!personnelId || !type || !licensePlate || !brand || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        personnelId,
        type,
        licensePlate,
        brand,
        model: model || '',
        color,
        photoFront: photoFront || null,
        photoBack: photoBack || null,
        photoSide: photoSide || null,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create vehicle' }, { status: 400 });
  }
}

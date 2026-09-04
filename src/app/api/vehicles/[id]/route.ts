import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { apiError, apiSuccess } from '@/lib/api-response';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return apiError('Invalid ID', 400);
    }

    const { user: authUser, error: authError } = await requireAuth(request);
    if (authError || !authUser) return authError || apiError('Unauthorized', 401);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return apiError('Vehicle not found', 404);
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
    
    return apiSuccess(updated);
  } catch (error: any) {
    return apiError('Failed to update vehicle', 500, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) {
      return apiError('Invalid ID', 400);
    }

    const { user: authUser, error: authError } = await requireAuth(request);
    if (authError || !authUser) return authError || apiError('Unauthorized', 401);

    const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } });
    if (!vehicle) {
      return apiError('Vehicle not found', 404);
    }

    // Must be own vehicle or have MANAGE_SYSTEM permission / SUPER_ADMIN
    if (vehicle.personnelId !== authUser.id && authUser.role !== 'SUPER_ADMIN') {
      const { error: permError } = await requirePermission(request, 'MANAGE_SYSTEM');
      if (permError) return permError;
    }

    await prisma.vehicle.delete({
      where: { id: params.id },
    });
    
    return apiSuccess({ success: true });
  } catch (error: any) {
    return apiError('Failed to delete vehicle', 500, error);
  }
}


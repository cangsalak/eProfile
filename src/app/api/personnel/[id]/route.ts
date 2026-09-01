import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendLineNotify } from '@/lib/notifications';
import { verifyAuth } from '@/lib/auth';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';
import { passwordPolicySchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    
    const { error: authError } = await requireAuth(request);
    if (authError) return authError;

    const person = await prisma.personnel.findUnique({
      where: { id: params.id },
    });
    
    if (!person) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    const { password, ...personWithoutPassword } = person;
    return NextResponse.json(personWithoutPassword);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    // Auth MUST happen before any DB mutation
    const authUser = await verifyAuth(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Allow editing own profile, otherwise require MANAGE_PERSONNEL
    if (authUser.id !== params.id) {
      const { error: authError } = await requirePermission(request, 'MANAGE_PERSONNEL');
      if (authError) return authError;
    }

    const body = await request.json();
    
    let passwordChanged = false;
    // Check if updating password — enforce Password Policy
    if (body.password) {
      const pwCheck = passwordPolicySchema.safeParse(body.password);
      if (!pwCheck.success) {
        return NextResponse.json({ error: pwCheck.error.issues[0].message }, { status: 400 });
      }
      body.password = await bcrypt.hash(body.password, 10);
      body.mustChangePassword = false;
      passwordChanged = true;
    } else {
      delete body.password; // Don't overwrite if empty
    }

    if (Array.isArray(body.skills)) {
      body.skills = JSON.stringify(body.skills);
    }

    // Remove fields that shouldn't be updated directly or are relations
    const allowedFields = [
      'prefix', 'firstName', 'lastName', 'position', 'department', 'subDepartment', 
      'personnelType', 'phone', 'mobile', 'email', 'status', 'avatarColor', 'skills', 
      'education', 'experience', 'notes', 'dateOfBirth', 'bloodType', 'religion', 
      'officialId', 'militaryBranch', 'commissionDate', 'currentAddress', 'currentTambon', 
      'currentAmphoe', 'currentProvince', 'currentZipcode', 'emergencyContactName', 
      'emergencyContactPhone', 'emergencyContactRelation', 'royalDecorations', 
      'trainingHistory', 'coverPhoto', 'profileTheme'
    ];

    const safeData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        safeData[field] = body[field];
      }
    }

    if (body.password) safeData.password = body.password;
    if (body.mustChangePassword !== undefined) safeData.mustChangePassword = body.mustChangePassword;
    
    // Only MANAGE_PERSONNEL can update role, badgeNo, citizenId
    const sysAdminCheck = await prisma.systemRole.findUnique({ where: { name: authUser.role } });
    const hasManagePersonnel = sysAdminCheck?.permissions?.includes('MANAGE_PERSONNEL') || sysAdminCheck?.permissions?.includes('MANAGE_SYSTEM');
    
    if (hasManagePersonnel) {
      if (body.role !== undefined) safeData.role = body.role;
      if (body.badgeNo !== undefined) safeData.badgeNo = body.badgeNo;
      if (body.citizenId !== undefined) safeData.citizenId = body.citizenId;
    }

    const updated = await prisma.personnel.update({
      where: { id: params.id },
      data: safeData,
    });
    
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action: 'PERSONNEL_UPDATED',
        entity: 'Personnel',
        entityId: updated.id,
        details: JSON.stringify({ name: `${updated.firstName} ${updated.lastName}` }),
        ipAddress: clientIp,
      }
    });

    if (passwordChanged) {
      await prisma.auditLog.create({
        data: {
          personnelId: authUser.id,
          action: 'PASSWORD_CHANGED',
          entity: 'Personnel',
          entityId: updated.id,
          details: 'User password was changed',
          ipAddress: clientIp,
        }
      });
    }

    const { password: _, ...updatedWithoutPassword } = updated;
    return NextResponse.json(updatedWithoutPassword);
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
    // Auth MUST happen before any DB mutation
    const authUser = await verifyAuth(request);
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { error: authError } = await requirePermission(request, 'MANAGE_PERSONNEL');
    if (authError) return authError;

    const person = await prisma.personnel.findUnique({ where: { id: params.id } });
    if (person) {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      await prisma.personnel.delete({ where: { id: params.id } });
      await sendLineNotify(`🗑️ ข้อมูลบุคลากรถูกลบออกจากระบบ: ${person.prefix}${person.firstName} ${person.lastName}`);
      await prisma.auditLog.create({
        data: {
          personnelId: authUser.id,
          action: 'PERSONNEL_DELETED',
          entity: 'Personnel',
          entityId: person.id,
          details: JSON.stringify({ name: `${person.firstName} ${person.lastName}` }),
          ipAddress: clientIp,
        }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return NextResponse.json({ error: 'Failed to delete personnel' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';
import { logSecurityEvent } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// GET /api/personnel/export - Export filtered personnel data respecting RBAC
export async function GET(req: Request) {
  try {
    const { error: authError, user: authUser } = await requireAuth(req);
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department') || '';
    const subDepartment = searchParams.get('subDepartment') || '';
    const status = searchParams.get('status') || '';
    const personnelType = searchParams.get('personnelType') || '';

    // Build Where Condition
    const where: Prisma.PersonnelWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { badgeNo: { contains: search } },
        { position: { contains: search } },
        { department: { contains: search } },
        { subDepartment: { contains: search } },
        { officialId: { contains: search } },
      ];
    }

    if (department && department !== 'all') {
      where.department = department;
    }

    if (subDepartment && subDepartment !== 'all') {
      where.subDepartment = subDepartment;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (personnelType && personnelType !== 'all') {
      where.personnelType = personnelType;
    }

    const isElevated = authUser.role === 'ADMIN' || authUser.role === 'SUPER_ADMIN';

    // Query records
    const list = await prisma.personnel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Sanitize export payload based on RBAC
    const exportData = list.map((person) => {
      const baseInfo = {
        badgeNo: person.badgeNo,
        prefix: person.prefix,
        firstName: person.firstName,
        lastName: person.lastName,
        position: person.position,
        department: person.department,
        subDepartment: person.subDepartment,
        personnelType: person.personnelType,
        status: person.status,
      };

      if (isElevated) {
        return {
          ...baseInfo,
          officialId: person.officialId,
          citizenId: person.citizenId,
          phone: person.phone,
          mobile: person.mobile,
          email: person.email,
          dateOfBirth: person.dateOfBirth,
          bloodType: person.bloodType,
          religion: person.religion,
          currentAddress: person.currentAddress,
          currentProvince: person.currentProvince,
          emergencyContactName: person.emergencyContactName,
          emergencyContactPhone: person.emergencyContactPhone,
        };
      }

      return baseInfo;
    });

    // Log Audit Event
    await logSecurityEvent({
      action: 'EXPORT_PERSONNEL',
      userId: authUser.id,
      endpoint: '/api/personnel/export',
      details: {
        totalRecords: exportData.length,
        filters: { search, department, subDepartment, status, personnelType },
      },
    });

    return NextResponse.json({
      data: exportData,
      total: exportData.length,
      exportedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to export personnel data' },
      { status: 500 }
    );
  }
}

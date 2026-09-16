import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendLineNotify, sendEmailNotification } from '@/modules/news/lib/notification-sender';
import {
  prisma,
  rateLimit,
  personnelRegistrationSchema,
  passwordPolicySchema,
  requireAuth,
  requirePermission,
  apiError,
  apiSuccess,
  isValidId,
  logSecurityEvent,
} from '@/modules/core';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const ALLOWED_SORT_FIELDS = [
  'firstName',
  'lastName',
  'badgeNo',
  'createdAt',
  'updatedAt',
  'status',
  'department',
  'position',
  'personnelType',
];

/**
 * GET /api/personnel - Fetch personnel with Server-side Pagination, Search, Filtering & Sorting
 */
export async function handleGetPersonnel(req: Request) {
  try {
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    const isAll = searchParams.get('all') === 'true';
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department') || '';
    const subDepartment = searchParams.get('subDepartment') || '';
    const status = searchParams.get('status') || '';
    const personnelType = searchParams.get('personnelType') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder')?.toLowerCase() || 'desc';

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json({ error: `Invalid sortBy field. Allowed: ${ALLOWED_SORT_FIELDS.join(', ')}` }, { status: 400 });
    }

    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json({ error: 'Invalid sortOrder. Allowed: asc, desc' }, { status: 400 });
    }

    const where: any = {};

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

    const now = new Date();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const nowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const leaveInclude = {
      leaves: {
        where: {
          status: { in: ['อนุมัติแล้ว', 'รออนุมัติ'] },
          startDate: { lte: nowEnd },
          endDate: { gte: nowStart },
        },
        orderBy: { createdAt: 'desc' as const },
        take: 1,
        select: {
          id: true,
          leaveType: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },
    };

    const mapPersonnel = (item: any) => {
      const { password, leaves, ...rest } = item;
      const activeLeave = leaves && leaves.length > 0 ? leaves[0] : null;
      return {
        ...rest,
        skills: JSON.parse(item.skills || '[]'),
        currentLeave: activeLeave
          ? {
              id: activeLeave.id,
              leaveType: activeLeave.leaveType,
              startDate: activeLeave.startDate,
              endDate: activeLeave.endDate,
              status: activeLeave.status,
            }
          : null,
      };
    };

    if (isAll) {
      const list = await prisma.personnel.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        include: leaveInclude,
      });

      return NextResponse.json(list.map(mapPersonnel));
    }

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (isNaN(page) || page < 1) {
      return NextResponse.json({ error: 'Invalid page parameter. Must be an integer >= 1' }, { status: 400 });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid limit parameter. Must be an integer between 1 and 100' }, { status: 400 });
    }

    const total = await prisma.personnel.count({ where });
    const list = await prisma.personnel.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: leaveInclude,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      data: list.map(mapPersonnel),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch personnel' }, { status: 500 });
  }
}

/**
 * POST /api/personnel - Create new personnel
 */
export async function handleCreatePersonnel(req: Request) {
  try {
    const { error: authError, user: authUser } = await requirePermission(req, 'MANAGE_PERSONNEL');
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResponse = NextResponse.next();
    try {
      await limiter.check(rateLimitResponse, 20, ip);
    } catch {
      return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' }, { status: 429 });
    }

    const rawBody = await req.json();
    const parsed = personnelRegistrationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }
    const body: any = parsed.data;

    const citizenId = body.citizenId || `TEMP${Date.now()}`;
    const badgeNo = body.badgeNo || Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const randomPassword = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6) + Math.floor(10 + Math.random() * 90);
    const passwordHash = await bcrypt.hash(body.password || randomPassword, 10);

    const created = await prisma.personnel.create({
      data: {
        badgeNo,
        citizenId,
        username: citizenId,
        password: passwordHash,
        role: body.role || 'OFFICER',
        prefix: body.prefix || 'นาย',
        firstName: body.firstName,
        lastName: body.lastName,
        position: body.position,
        department: body.department || 'กองเทคโนโลยีสารสนเทศ',
        subDepartment: body.subDepartment || 'แผนกบริหารทั่วไป',
        personnelType: body.personnelType || 'นายทหารสัญญาบัตร',
        phone: body.phone || '02-555-1234',
        mobile: body.mobile || '080-000-0000',
        email: body.email || 'user@rta.mi.th',
        status: body.status || 'ปฏิบัติงานปกติ',
        avatarColor: body.avatarColor || '#3b82f6',
        skills: JSON.stringify(body.skills || []),
        education: body.education || '',
        experience: body.experience || '',
        notes: body.notes || '',
        dateOfBirth: body.dateOfBirth || '',
        bloodType: body.bloodType || '',
        religion: body.religion || '',
        officialId: body.officialId || '',
        militaryBranch: body.militaryBranch || '',
        commissionDate: body.commissionDate || '',
        currentAddress: body.currentAddress || '',
        emergencyContactName: body.emergencyContactName || '',
        emergencyContactPhone: body.emergencyContactPhone || '',
        emergencyContactRelation: body.emergencyContactRelation || '',
        royalDecorations: body.royalDecorations || '',
        trainingHistory: body.trainingHistory || '',
      },
    });

    const systemNameSetting = await prisma.systemSetting.findUnique({ where: { key: 'systemName' } });
    const sysName = systemNameSetting?.value || 'ระบบฐานข้อมูลบุคลากร';

    await sendLineNotify(`✨ มีบุคลากรใหม่ถูกเพิ่ม: ${created.prefix}${created.firstName} ${created.lastName} ตำแหน่ง ${created.position}`);
    await sendEmailNotification(
      'New Personnel Added - ' + sysName,
      `A new personnel has been added to the system:\n\nName: ${created.prefix}${created.firstName} ${created.lastName}\nPosition: ${created.position}\nDepartment: ${created.department}`
    );

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action: 'PERSONNEL_CREATED',
        entity: 'Personnel',
        entityId: created.id,
        details: JSON.stringify({ name: `${created.firstName} ${created.lastName}`, position: created.position }),
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1',
      },
    }).catch(() => {});

    const { password: _, ...createdWithoutPassword } = created;
    return NextResponse.json({ ...createdWithoutPassword, skills: JSON.parse(created.skills || '[]') }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create personnel' }, { status: 400 });
  }
}

/**
 * GET /api/personnel/[id] - Get individual personnel profile
 */
export async function handleGetPersonnelById(
  request: Request,
  context: { params: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = (context.params as any).id;
    if (!isValidId(id)) return apiError('Invalid ID', 400);

    const { error: authError } = await requireAuth(request);
    if (authError) return authError;

    const person = await prisma.personnel.findUnique({
      where: { id },
    });

    if (!person) {
      return apiError('Personnel not found', 404);
    }

    const { password, ...personWithoutPassword } = person;
    return apiSuccess(personWithoutPassword);
  } catch (error) {
    return apiError('Failed to fetch personnel', 500, error);
  }
}

/**
 * PUT /api/personnel/[id] - Update personnel profile
 */
export async function handleUpdatePersonnelById(
  request: Request,
  context: { params: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = (context.params as any).id;
    if (!isValidId(id)) return apiError('Invalid ID', 400);

    const { user: authUser, error: reqAuthErr } = await requireAuth(request);
    if (reqAuthErr || !authUser) return reqAuthErr || apiError('Unauthorized', 401);

    if (authUser.id !== id) {
      const { error: authError } = await requirePermission(request, 'MANAGE_PERSONNEL');
      if (authError) return authError;
    }

    const body = await request.json();

    let passwordChanged = false;
    if (body.password) {
      const pwCheck = passwordPolicySchema.safeParse(body.password);
      if (!pwCheck.success) {
        return apiError(pwCheck.error.issues[0].message, 400);
      }
      body.password = await bcrypt.hash(body.password, 10);
      body.mustChangePassword = false;
      passwordChanged = true;
    } else {
      delete body.password;
    }

    if (Array.isArray(body.skills)) {
      body.skills = JSON.stringify(body.skills);
    }

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

    const sysAdminCheck = await prisma.systemRole.findUnique({ where: { name: authUser.role } });
    const hasManagePersonnel = sysAdminCheck?.permissions?.includes('MANAGE_PERSONNEL') || sysAdminCheck?.permissions?.includes('MANAGE_SYSTEM');

    if (hasManagePersonnel) {
      if (body.role !== undefined) safeData.role = body.role;
      if (body.badgeNo !== undefined) safeData.badgeNo = body.badgeNo;
      if (body.citizenId !== undefined) safeData.citizenId = body.citizenId;
    }

    const updated = await prisma.personnel.update({
      where: { id },
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
      },
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
        },
      });
    }

    const { password: _, ...updatedWithoutPassword } = updated;
    return apiSuccess(updatedWithoutPassword);
  } catch (error) {
    return apiError('Failed to update personnel', 500, error);
  }
}

/**
 * DELETE /api/personnel/[id] - Delete personnel
 */
export async function handleDeletePersonnelById(
  request: Request,
  context: { params: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = (context.params as any).id;
    if (!isValidId(id)) return apiError('Invalid ID', 400);

    const { user: authUser, error: reqAuthErr } = await requireAuth(request);
    if (reqAuthErr || !authUser) return reqAuthErr || apiError('Unauthorized', 401);

    const { error: authError } = await requirePermission(request, 'MANAGE_PERSONNEL');
    if (authError) return authError;

    const person = await prisma.personnel.findUnique({ where: { id } });
    if (person) {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1';
      await prisma.personnel.delete({ where: { id } });
      await sendLineNotify(`🗑️ ข้อมูลบุคลากรถูกลบออกจากระบบ: ${person.prefix}${person.firstName} ${person.lastName}`);
      await prisma.auditLog.create({
        data: {
          personnelId: authUser.id,
          action: 'PERSONNEL_DELETED',
          entity: 'Personnel',
          entityId: person.id,
          details: JSON.stringify({ name: `${person.firstName} ${person.lastName}` }),
          ipAddress: clientIp,
        },
      });
    }
    return apiSuccess({ success: true });
  } catch (error) {
    return apiError('Failed to delete personnel', 500, error);
  }
}

/**
 * GET /api/personnel/stats - Aggregated personnel stats
 */
export async function handleGetPersonnelStats(req: Request) {
  try {
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

    const total = await prisma.personnel.count();
    const active = await prisma.personnel.count({ where: { status: 'ปฏิบัติงานปกติ' } });
    const byDepartmentRaw = await prisma.personnel.groupBy({
      by: ['department'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const byPersonnelTypeRaw = await prisma.personnel.groupBy({
      by: ['personnelType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });
    const byStatusRaw = await prisma.personnel.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const inactive = total - active;

    const byDepartment = byDepartmentRaw.map((item) => ({
      department: item.department || 'ไม่ระบุ',
      count: item._count.id,
    }));

    const byPersonnelType = byPersonnelTypeRaw.map((item) => ({
      type: item.personnelType || 'ไม่ระบุ',
      count: item._count.id,
    }));

    const byStatus = byStatusRaw.map((item) => ({
      status: item.status || 'ไม่ระบุ',
      count: item._count.id,
    }));

    return NextResponse.json({
      summary: {
        total,
        active,
        inactive,
      },
      byDepartment,
      byPersonnelType,
      byStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch personnel statistics' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/personnel/export - Export personnel data respecting RBAC
 */
export async function handleExportPersonnel(req: Request) {
  try {
    const { error: authError, user: authUser } = await requireAuth(req);
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const department = searchParams.get('department') || '';
    const subDepartment = searchParams.get('subDepartment') || '';
    const status = searchParams.get('status') || '';
    const personnelType = searchParams.get('personnelType') || '';

    const where: any = {};

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

    const list = await prisma.personnel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

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

/**
 * GET /api/departments - List all departments
 */
export async function handleGetDepartments() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

/**
 * POST /api/departments - Create department
 */
export async function handleCreateDepartment(request: Request) {
  try {
    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อหน่วยงาน' }, { status: 400 });
    }

    let subDepartmentsJson = '[]';
    if (Array.isArray(body.subDepartments)) {
      subDepartmentsJson = JSON.stringify(body.subDepartments);
    } else if (typeof body.subDepartments === 'string') {
      subDepartmentsJson = body.subDepartments;
    }

    const department = await prisma.department.create({
      data: {
        name: body.name.trim(),
        shortName: body.shortName ? body.shortName.trim() : '',
        subDepartments: subDepartmentsJson,
        sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 0,
      },
    });
    return NextResponse.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

/**
 * PUT /api/departments/[id] - Update department
 */
export async function handleUpdateDepartment(
  request: Request,
  context: { params: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = (context.params as any).id;
    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    const body = await request.json();
    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อหน่วยงาน' }, { status: 400 });
    }

    let subDepartmentsJson = undefined;
    if (Array.isArray(body.subDepartments)) {
      subDepartmentsJson = JSON.stringify(body.subDepartments);
    } else if (typeof body.subDepartments === 'string') {
      subDepartmentsJson = body.subDepartments;
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: body.name.trim(),
        ...(body.shortName !== undefined && { shortName: body.shortName ? body.shortName.trim() : '' }),
        ...(subDepartmentsJson !== undefined && { subDepartments: subDepartmentsJson }),
        ...(typeof body.sortOrder === 'number' && { sortOrder: body.sortOrder }),
      },
    });
    return NextResponse.json(department);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'ชื่อหน่วยงานนี้มีอยู่ในระบบแล้ว' }, { status: 400 });
    }
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

/**
 * DELETE /api/departments/[id] - Delete department
 */
export async function handleDeleteDepartment(
  request: Request,
  context: { params: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = (context.params as any).id;
    if (!isValidId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { error: authError } = await requirePermission(request, 'MANAGE_SYSTEM');
    if (authError) return authError;

    await prisma.department.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}

/**
 * GET /api/personnel/[id]/documents - List documents for a personnel
 */
export async function handleGetDocuments(
  request: Request,
  context: { params: Record<string, string | string[]> | { id?: string; personnelId?: string } }
) {
  try {
    const { user, error: authError } = await requireAuth(request);
    if (authError || !user) return authError;

    const personnelId = (context.params as any).id || (context.params as any).personnelId;
    if (!personnelId || !isValidId(personnelId)) {
      return NextResponse.json({ error: 'Invalid personnel ID' }, { status: 400 });
    }

    const documents = await prisma.personnelDocument.findMany({
      where: { personnelId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error listing personnel documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

/**
 * POST /api/personnel/[id]/documents - Create document metadata
 */
export async function handleCreateDocument(
  request: Request,
  context: { params: Record<string, string | string[]> | { id?: string; personnelId?: string } }
) {
  try {
    const { user, error: authError } = await requireAuth(request);
    if (authError || !user) return authError;

    const personnelId = (context.params as any).id || (context.params as any).personnelId;
    if (!personnelId || !isValidId(personnelId)) {
      return NextResponse.json({ error: 'Invalid personnel ID' }, { status: 400 });
    }

    const body = await request.json();
    const { category, filename, mimeType, size, storagePath, notes, expiresAt } = body;

    if (!category || !filename || !mimeType || typeof size !== 'number' || !storagePath) {
      return NextResponse.json({ error: 'Missing required document fields' }, { status: 400 });
    }

    const doc = await prisma.personnelDocument.create({
      data: {
        personnelId,
        category,
        filename,
        mimeType,
        size,
        storagePath,
        notes: notes || null,
        uploadedBy: user.username || user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Error creating personnel document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export * from './rpb1';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendLineNotify, sendEmailNotification } from '@/lib/notifications';
import rateLimit from '@/lib/rate-limit';
import { personnelRegistrationSchema } from '@/lib/validations';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { Prisma } from '@prisma/client';


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
  'personnelType'
];

// GET /api/personnel - Fetch personnel with Server-side Pagination, Search, Filtering & Sorting
export async function GET(req: Request) {
  try {
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

    const { searchParams } = new URL(req.url);

    // Legacy bypass for full list if requested explicitly
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

    // Validate Sorting
    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json({ error: `Invalid sortBy field. Allowed: ${ALLOWED_SORT_FIELDS.join(', ')}` }, { status: 400 });
    }

    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      return NextResponse.json({ error: 'Invalid sortOrder. Allowed: asc, desc' }, { status: 400 });
    }

    // Build Where Condition
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

      const parsed = list.map(mapPersonnel);

      return NextResponse.json(parsed);
    }

    // Pagination Validation
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

    const parsed = list.map(mapPersonnel);

    return NextResponse.json({
      data: parsed,
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

// POST /api/personnel - Create new personnel in SQLite
export async function POST(req: Request) {
  try {
    // Permission check
    const { error: authError, user: authUser } = await requirePermission(req, 'MANAGE_PERSONNEL');
    if (authError || !authUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate Limit check based on IP for registration spam
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResponse = NextResponse.next();
    try {
      await limiter.check(rateLimitResponse, 20, ip); // 20 requests per minute per IP
    } catch {
      return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' }, { status: 429 });
    }

    const rawBody = await req.json();
    
    // Zod validation (basic fields)
    const parsed = personnelRegistrationSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: (parsed.error as any).errors[0].message }, { status: 400 });
    }
    const body: any = parsed.data;
    
    // CitizenId must be 13 digits, BadgeNo must be 10 digits
    const citizenId = body.citizenId || `TEMP${Date.now()}`;
    const badgeNo = body.badgeNo || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Generate a secure random password if not provided
    const randomPassword = Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6) + Math.floor(10 + Math.random() * 90);
    const passwordHash = await bcrypt.hash(body.password || randomPassword, 10);

    const created = await prisma.personnel.create({
      data: {
        badgeNo: badgeNo,
        citizenId: citizenId,
        username: citizenId, // Username is now citizenId
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

    // Send notification
    await sendLineNotify(`✨ มีบุคลากรใหม่ถูกเพิ่ม: ${created.prefix}${created.firstName} ${created.lastName} ตำแหน่ง ${created.position}`);
    await sendEmailNotification(
      'New Personnel Added - ' + sysName,
      `A new personnel has been added to the system:\n\nName: ${created.prefix}${created.firstName} ${created.lastName}\nPosition: ${created.position}\nDepartment: ${created.department}`
    );

    // Audit log: PERSONNEL_CREATED
    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action: 'PERSONNEL_CREATED',
        entity: 'Personnel',
        entityId: created.id,
        details: JSON.stringify({ name: `${created.firstName} ${created.lastName}`, position: created.position }),
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1',
      },
    }).catch(() => {/* non-blocking */});

    const { password: _, ...createdWithoutPassword } = created;
    return NextResponse.json({ ...createdWithoutPassword, skills: JSON.parse(created.skills || '[]') }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create personnel' }, { status: 400 });
  }
}

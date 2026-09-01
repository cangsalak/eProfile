import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendLineNotify, sendEmailNotification } from '../../../lib/notifications';
import rateLimit from '@/lib/rate-limit';
import { personnelRegistrationSchema } from '@/lib/validations';
import { requireAuth, requirePermission } from '@/lib/auth-guards';


const limiter = rateLimit({
  interval: 60 * 1000, 
  uniqueTokenPerInterval: 500, 
});

// GET /api/personnel - Fetch all personnel from SQLite
export async function GET(req: Request) {
  try {
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

    const list = await prisma.personnel.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const parsed = list.map((item) => {
      const { password, ...rest } = item;
      return {
        ...rest,
        skills: JSON.parse(item.skills || '[]'),
      };
    });

    return NextResponse.json(parsed);
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
      },
    }).catch(() => {/* non-blocking */});

    const { password: _, ...createdWithoutPassword } = created;
    return NextResponse.json({ ...createdWithoutPassword, skills: JSON.parse(created.skills || '[]') }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create personnel' }, { status: 400 });
  }
}

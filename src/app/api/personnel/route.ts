import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { sendLineNotify, sendEmailNotification } from '../../../lib/notifications';

// GET /api/personnel - Fetch all personnel from SQLite
export async function GET() {
  try {
    const list = await prisma.personnel.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const parsed = list.map((item) => ({
      ...item,
      skills: JSON.parse(item.skills || '[]'),
    }));

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch personnel' }, { status: 500 });
  }
}

// POST /api/personnel - Create new personnel in SQLite
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // CitizenId must be 13 digits, BadgeNo must be 10 digits
    const citizenId = body.citizenId || `TEMP${Date.now()}`;
    const badgeNo = body.badgeNo || Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const officialId = body.officialId || '';
    
    // Password is the officialId (10-digit military ID) if available, else badgeNo
    const defaultPassword = officialId ? officialId : badgeNo;
    const passwordHash = await bcrypt.hash(body.password || defaultPassword, 10);

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
        citizenId: body.citizenId || '',
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

    // Send notification
    await sendLineNotify(`✨ มีบุคลากรใหม่ถูกเพิ่ม: ${created.prefix}${created.firstName} ${created.lastName} ตำแหน่ง ${created.position}`);
    await sendEmailNotification(
      'New Personnel Added - eProfile System',
      `A new personnel has been added to the system:\n\nName: ${created.prefix}${created.firstName} ${created.lastName}\nPosition: ${created.position}\nDepartment: ${created.department}`
    );

    return NextResponse.json({ ...created, skills: JSON.parse(created.skills || '[]') }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create personnel' }, { status: 400 });
  }
}

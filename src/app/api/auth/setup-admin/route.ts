import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET_CODE = 'RTA-ADMIN-2026';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { citizenId, badgeNo, firstName, lastName, secretCode } = body;

    if (!citizenId || !badgeNo || !firstName || !lastName || !secretCode) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    if (secretCode !== ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'รหัสลับไม่ถูกต้อง (Invalid Secret Code)' }, { status: 403 });
    }

    // Check if the user already exists
    let person = await prisma.personnel.findFirst({
      where: {
        OR: [
          { citizenId },
          { badgeNo }
        ]
      }
    });

    const passwordHash = await bcrypt.hash(badgeNo, 10);

    if (person) {
      // Promote to admin
      person = await prisma.personnel.update({
        where: { id: person.id },
        data: {
          role: 'ADMIN',
          password: passwordHash
        }
      });
    } else {
      // Create new admin
      person = await prisma.personnel.create({
        data: {
          citizenId,
          badgeNo,
          username: citizenId,
          password: passwordHash,
          role: 'ADMIN',
          prefix: 'นาย',
          firstName,
          lastName,
          position: 'ผู้ดูแลระบบ (System Admin)',
          department: 'กองเทคโนโลยีสารสนเทศ',
          subDepartment: '-',
          personnelType: 'นายทหารสัญญาบัตร',
          phone: '-',
          mobile: '-',
          email: `${citizenId}@rta.mi.th`,
          status: 'ปฏิบัติงานปกติ',
          avatarColor: '#f43f5e',
          skills: '[]'
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Admin setup successful' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Setup failed' }, { status: 500 });
  }
}

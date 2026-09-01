import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { passwordPolicySchema } from '@/lib/validations';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
  try {
    // 1. One-time Check: If system is already installed, reject permanently with 403
    const isInstalledSetting = await prisma.systemSetting.findUnique({
      where: { key: 'isInstalled' }
    });

    if (isInstalledSetting?.value === 'true') {
      return NextResponse.json({ error: 'System is already installed' }, { status: 403 });
    }

    const rawBody = await req.json();
    const { systemName, firstName, lastName, citizenId, badgeNo, password, setupSecret } = rawBody;

    // 2. Secret Verification: Validate admin setup secret only if configured in .env
    const headerSecret = req.headers.get('x-admin-setup-secret');
    const configuredSecret = process.env.ADMIN_SETUP_SECRET?.trim();

    if (configuredSecret && configuredSecret !== '') {
      const providedSecret = (headerSecret || setupSecret || '').trim();
      if (!providedSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({ error: 'รหัสลับการติดตั้งไม่ถูกต้อง (Invalid Setup Secret)' }, { status: 401 });
      }
    }

    // 3. Required Fields Validation
    if (!firstName || !lastName || !citizenId || !badgeNo || !password) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // 4. Enforce Password Policy
    const pwCheck = passwordPolicySchema.safeParse(password);
    if (!pwCheck.success) {
      return NextResponse.json({ error: pwCheck.error.issues[0].message }, { status: 400 });
    }

    // 5. Setup System Settings & Default Options
    const defaultSettings: Record<string, string> = {
      systemName: systemName || 'ระบบฐานข้อมูลบุคลากร',
      isInstalled: 'true',
      personnelTypes: JSON.stringify(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']),
      statusList: JSON.stringify(['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ']),
      prefixes: JSON.stringify(['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.']),
      leaveTypes: JSON.stringify(['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ']),
      vehicleTypes: JSON.stringify(['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ']),
      bloodGroups: JSON.stringify(['A', 'B', 'AB', 'O']),
      educationLevels: JSON.stringify(['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก']),
      theme: 'dark',
      badgeColorMode: 'auto',
      badgeShowLogo: 'true',
      badgeShowQr: 'true',
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }

    // 6. Setup Default System Roles
    const defaultRoles = [
      {
        name: 'SUPER_ADMIN',
        displayName: 'ผู้ดูแลระบบสูงสุด',
        description: 'มีสิทธิ์เข้าถึงทุกส่วนของระบบ (Super Admin)',
        permissions: JSON.stringify([
          'MANAGE_SYSTEM', 'MANAGE_ROLES', 'MANAGE_PERSONNEL', 
          'MANAGE_DEPARTMENTS', 'MANAGE_POSTS', 'VIEW_AUDIT_LOGS', 
          'MANAGE_CONTACTS', 'APPROVE_LEAVE'
        ]),
        isSystem: true
      },
      {
        name: 'ADMIN',
        displayName: 'ผู้ดูแลระบบ',
        description: 'มีสิทธิ์ดูแลจัดการข้อมูลบุคลากรและระบบบางส่วน',
        permissions: JSON.stringify([
          'MANAGE_PERSONNEL', 'MANAGE_DEPARTMENTS', 'MANAGE_POSTS', 'APPROVE_LEAVE'
        ]),
        isSystem: true
      },
      {
        name: 'EDITOR',
        displayName: 'ผู้จัดการเนื้อหา',
        description: 'มีสิทธิ์จัดการข่าวสารและเนื้อหา',
        permissions: JSON.stringify([
          'MANAGE_POSTS'
        ]),
        isSystem: true
      },
      {
        name: 'USER',
        displayName: 'ผู้ใช้งานทั่วไป',
        description: 'สิทธิ์พื้นฐานสำหรับกำลังพล',
        permissions: JSON.stringify([]),
        isSystem: true
      }
    ];

    for (const role of defaultRoles) {
      await prisma.systemRole.upsert({
        where: { name: role.name },
        update: {}, 
        create: role
      });
    }

    // 7. Setup System Placeholder Users (with unguessable random password)
    const dummyPasswordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
    await prisma.personnel.upsert({
      where: { id: 'ALL' },
      update: {},
      create: {
        id: 'ALL',
        badgeNo: 'SYSTEM_ALL',
        username: 'SYSTEM_ALL',
        password: dummyPasswordHash,
        role: 'USER',
        prefix: '-',
        firstName: 'System',
        lastName: 'All Users',
        position: '-',
        department: '-',
        subDepartment: '-',
        phone: '-',
        mobile: '-',
        email: 'all@system.local'
      }
    });

    await prisma.personnel.upsert({
      where: { id: 'ADMIN' },
      update: {},
      create: {
        id: 'ADMIN',
        badgeNo: 'SYSTEM_ADMIN',
        username: 'SYSTEM_ADMIN',
        password: dummyPasswordHash,
        role: 'ADMIN',
        prefix: '-',
        firstName: 'System',
        lastName: 'Admins',
        position: '-',
        department: '-',
        subDepartment: '-',
        phone: '-',
        mobile: '-',
        email: 'admin@system.local'
      }
    });

    // 8. Create SUPER_ADMIN
    const adminPasswordHash = await bcrypt.hash(password, 10);
    const username = citizenId;

    const superAdmin = await prisma.personnel.upsert({
      where: { badgeNo },
      update: {
        password: adminPasswordHash,
        role: 'SUPER_ADMIN',
        firstName,
        lastName,
        mustChangePassword: false,
      },
      create: {
        badgeNo,
        citizenId,
        username,
        password: adminPasswordHash,
        role: 'SUPER_ADMIN',
        prefix: 'คุณ',
        firstName,
        lastName,
        position: 'ผู้ดูแลระบบสูงสุด',
        department: 'ส่วนกลาง',
        subDepartment: '-',
        personnelType: 'ผู้ดูแลระบบ',
        phone: '-',
        mobile: '-',
        email: 'admin@localhost',
        status: 'ปฏิบัติงานปกติ',
        avatarColor: '#10b981',
        mustChangePassword: false,
      }
    });

    // 9. Audit Log: INSTALLATION_COMPLETED
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        personnelId: superAdmin.id,
        action: 'INSTALLATION_COMPLETED',
        entity: 'SystemSetting',
        entityId: 'isInstalled',
        details: JSON.stringify({ systemName: systemName || 'ระบบฐานข้อมูลบุคลากร', admin: superAdmin.username }),
        ipAddress: ip,
      }
    }).catch(() => {});

    // 10. Generate JWT Session
    const token = await new SignJWT({ 
        id: superAdmin.id, 
        role: superAdmin.role, 
        username: superAdmin.username 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(encodedSecret);

    const { password: _, ...userProfile } = superAdmin;
    let permissions: string[] = [];
    const systemRole = await prisma.systemRole.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (systemRole) {
      permissions = JSON.parse(systemRole.permissions || '[]');
    }

    const response = NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        skills: JSON.parse(superAdmin.skills || '[]'),
        permissions
      }
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Install error:', error);
    return NextResponse.json({ error: error.message || 'Installation failed' }, { status: 500 });
  }
}

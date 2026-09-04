import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { installRequestSchema } from '@/lib/validations';
import { ROLE_DEFINITIONS } from '@/lib/role-definitions';
import { seedDemoDataset } from '@/lib/installer/sample-data';

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

    let rawBody: any;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    // 2. Secret Verification:
    // In Production mode, ADMIN_SETUP_SECRET is strictly mandatory.
    const isProduction = process.env.NODE_ENV === 'production';
    const headerSecret = req.headers.get('x-admin-setup-secret');
    const configuredSecret = process.env.ADMIN_SETUP_SECRET?.trim();
    const providedSecret = (headerSecret || rawBody?.setupSecret || '').trim();

    if (isProduction) {
      if (!configuredSecret || configuredSecret === '') {
        return NextResponse.json({
          error: 'ระบบอยู่ในโหมด Production แต่ยังไม่ได้กำหนดค่า ADMIN_SETUP_SECRET ในตัวแปรสภาพแวดล้อม (.env)'
        }, { status: 401 });
      }
      if (!providedSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({ error: 'รหัสลับการติดตั้งไม่ถูกต้อง (Invalid Setup Secret)' }, { status: 401 });
      }
    } else if (configuredSecret && configuredSecret !== '') {
      if (!providedSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({ error: 'รหัสลับการติดตั้งไม่ถูกต้อง (Invalid Setup Secret)' }, { status: 401 });
      }
    }

    // 3. Strict Zod Schema Validation
    const validationResult = installRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      return NextResponse.json({ error: issue?.message || 'ข้อมูลการติดตั้งไม่ถูกต้อง' }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      citizenId,
      badgeNo,
      password,
      systemName,
      organizationName,
      organizationAddress,
      organizationPhone,
      contactPhoneSecondary,
      contactEmail,
      contactEmailSupport,
      contactMapEmbedUrl,
      contactMapLink,
      dbProvider,
      dbConnectionString,
      installDemoData,
      theme
    } = validationResult.data;

    // Hash admin password before transaction
    const adminPasswordHash = await bcrypt.hash(password, 10);
    const dummyPasswordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
    const username = citizenId;
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // 4. Sanitize dbConnectionString (do not store raw plaintext passwords in settings if not needed)
    let safeDbConnectionString = dbConnectionString || '';
    if (safeDbConnectionString && safeDbConnectionString.includes('://') && safeDbConnectionString.includes('@')) {
      try {
        const parsedUrl = new URL(safeDbConnectionString);
        if (parsedUrl.password) {
          parsedUrl.password = '******';
          safeDbConnectionString = parsedUrl.toString();
        }
      } catch {
        // if not standard URL, preserve sanitized string
      }
    }

    const defaultSettings: Record<string, string> = {
      systemName: systemName || 'ระบบฐานข้อมูลบุคลากร',
      organizationName: organizationName || 'กองบัญชาการ / หน่วยงานต้นสังกัด',
      organizationAddress: organizationAddress || 'ศูนย์ราชการเฉลิมพระเกียรติฯ อาคาร B ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพมหานคร 10210',
      organizationPhone: organizationPhone || '02-123-4567',
      contactPhoneSecondary: contactPhoneSecondary || '02-123-4568 (ฝ่ายบริการ/สอบถาม)',
      contactEmail: contactEmail || 'contact@eprofile.com',
      contactEmailSupport: contactEmailSupport || 'support@eprofile.com',
      contactMapEmbedUrl: contactMapEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.7142718131343!2d100.56209507567849!3d13.886121595166432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e28329ab59218d%3A0xc6cba4b4260dfa02!2sGovernment%20Complex!5e0!3m2!1sen!2sth!4v1709210214327!5m2!1sen!2sth',
      contactMapLink: contactMapLink || 'https://maps.google.com/?q=Government+Complex+Chaeng+Watthana',
      isInstalled: 'true',
      dbProvider: String(dbProvider || 'sqlite'),
      dbConnectionString: safeDbConnectionString,
      hasDemoData: installDemoData ? 'true' : 'false',
      personnelTypes: JSON.stringify(['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ']),
      statusList: JSON.stringify(['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ']),
      prefixes: JSON.stringify(['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.']),
      leaveTypes: JSON.stringify(['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ']),
      leavePolicy: JSON.stringify({ 'ลาพักผ่อน': 10, 'ลากิจ': 45, 'ลาป่วย': 60, 'ลาคลอดบุตร': 90, 'ลาอุปสมบท': 120 }),
      vehicleTypes: JSON.stringify(['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ']),
      bloodGroups: JSON.stringify(['A', 'B', 'AB', 'O']),
      educationLevels: JSON.stringify(['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก']),
      enabledModules: JSON.stringify(['personnel', 'leaves', 'vehicles', 'badges', 'calendar', 'news', 'contacts', 'command-dashboard', 'system-inspector', 'menus', 'theme', 'backup']),
      theme: String(theme || 'dark'),
      badgeColorMode: 'auto',
      badgeShowLogo: 'true',
      badgeShowQr: 'true',
    };

    // 5. Execute Installation in Atomic Transaction (Rollback on Any Failure & Prevent Race Condition)
    const result = await prisma.$transaction(async (tx) => {
      // Re-verify isInstalled inside transaction to prevent concurrent race conditions
      const lockCheck = await tx.systemSetting.findUnique({ where: { key: 'isInstalled' } });
      if (lockCheck?.value === 'true') {
        throw new Error('System is already installed');
      }

      // 5.1 Save System Settings
      for (const [key, value] of Object.entries(defaultSettings)) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      }

      // 5.2 Setup System Roles
      for (const role of ROLE_DEFINITIONS) {
        await tx.systemRole.upsert({
          where: { name: role.name },
          update: {
            displayName: role.displayName,
            description: role.description,
            permissions: JSON.stringify(role.permissions),
            isSystem: role.isSystem,
          },
          create: {
            name: role.name,
            displayName: role.displayName,
            description: role.description,
            permissions: JSON.stringify(role.permissions),
            isSystem: role.isSystem,
          },
        });
      }

      // 5.3 Setup System Placeholder Users
      await tx.personnel.upsert({
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

      await tx.personnel.upsert({
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

      // 5.4 Create Super Admin
      const superAdmin = await tx.personnel.upsert({
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
          email: contactEmail || 'admin@localhost',
          status: 'ปฏิบัติงานปกติ',
          avatarColor: '#10b981',
          mustChangePassword: false,
        }
      });

      // 5.5 Seed Sample / Demo Data if selected
      if (installDemoData) {
        await seedDemoDataset(tx as any);
      }

      // 5.6 Audit Log
      await tx.auditLog.create({
        data: {
          personnelId: superAdmin.id,
          action: 'INSTALLATION_COMPLETED',
          entity: 'SystemSetting',
          entityId: 'isInstalled',
          details: JSON.stringify({
            systemName: systemName || 'ระบบฐานข้อมูลบุคลากร',
            admin: superAdmin.username,
            dbProvider,
            installDemoData: Boolean(installDemoData)
          }),
          ipAddress: clientIp,
        }
      }).catch(() => {});

      return superAdmin;
    });

    // 6. Generate JWT Session for installed Super Admin
    const token = await new SignJWT({
        id: result.id,
        role: result.role,
        username: result.username
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(encodedSecret);

    const { password: _, ...userProfile } = result;
    let permissions: string[] = [];
    const systemRole = await prisma.systemRole.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (systemRole) {
      permissions = JSON.parse(systemRole.permissions || '[]');
    }

    const response = NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        skills: JSON.parse(result.skills || '[]'),
        permissions
      }
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Install error:', error);
    if (error.message === 'System is already installed') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || 'Installation failed' }, { status: 500 });
  }
}

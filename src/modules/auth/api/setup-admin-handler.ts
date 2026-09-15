import { NextResponse } from 'next/server';
import { prisma, rateLimit } from '@/modules/core';
import bcrypt from 'bcryptjs';

const ADMIN_SECRET_CODE = process.env.ADMIN_SETUP_SECRET;

const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 200,
});

export async function handleSetupAdmin(req: Request) {
  const res = NextResponse.next();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  // ── Rate limit: 5 attempts / 15 min per IP ──────────────────────────────
  try {
    await limiter.check(res, 5, `setup-admin:${ip}`);
  } catch {
    return NextResponse.json(
      { error: 'Too many setup attempts. Please wait 15 minutes.' },
      { status: 429, headers: res.headers }
    );
  }

  // ── Block permanently after install ─────────────────────────────────────
  try {
    const installed = await prisma.systemSetting.findUnique({ where: { key: 'isInstalled' } });
    if (installed?.value === 'true') {
      // Log the intrusion attempt
      await prisma.auditLog.create({
        data: {
          personnelId: 'SYSTEM',
          action: 'SETUP_ADMIN_BLOCKED',
          entity: 'Personnel',
          entityId: 'setup-admin',
          details: JSON.stringify({ reason: 'post-install attempt', ip }),
          ipAddress: ip,
        },
      }).catch(() => {});

      return NextResponse.json(
        { error: 'This endpoint is no longer available after system installation.' },
        { status: 410 } // 410 Gone — permanently disabled
      );
    }
  } catch {
    // If the DB is not yet reachable (very first install), allow through
  }

  // ── Require ADMIN_SETUP_SECRET to be configured ──────────────────────────
  if (!ADMIN_SECRET_CODE) {
    return NextResponse.json(
      { error: 'Server configuration error: ADMIN_SETUP_SECRET is not set.' },
      { status: 500 }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { citizenId, badgeNo, firstName, lastName, secretCode } = body as Record<string, string>;

  if (!citizenId || !badgeNo || !firstName || !lastName || !secretCode) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
  }

  const cleanCitizenId = String(citizenId).trim();
  const cleanBadgeNo = String(badgeNo).trim();

  if (!/^\d{13}$/.test(cleanCitizenId)) {
    return NextResponse.json({ error: 'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก' }, { status: 400 });
  }
  if (!/^\d{10}$/.test(cleanBadgeNo)) {
    return NextResponse.json({ error: 'หมายเลขประจำตัวต้องเป็นตัวเลข 10 หลัก' }, { status: 400 });
  }

  // ── Constant-time string comparison for secret ────────────────────────────
  const secretBuffer = Buffer.from(secretCode);
  const expectedBuffer = Buffer.from(ADMIN_SECRET_CODE);
  const isMatch =
    secretBuffer.length === expectedBuffer.length &&
    require('crypto').timingSafeEqual(secretBuffer, expectedBuffer);

  if (!isMatch) {
    await prisma.auditLog.create({
      data: {
        personnelId: 'SYSTEM',
        action: 'SETUP_ADMIN_INVALID_SECRET',
        entity: 'Personnel',
        entityId: cleanCitizenId,
        details: JSON.stringify({ ip, citizenId: cleanCitizenId }),
        ipAddress: ip,
      },
    }).catch(() => {});

    return NextResponse.json({ error: 'รหัสลับตั้งค่าผู้ดูแลระบบไม่ถูกต้อง' }, { status: 401 });
  }

  // ── Default Password from last 4 digits of Citizen ID ───────────────────
  const defaultPassword = cleanCitizenId.slice(-4);
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // ── Upsert SUPER_ADMIN inside transaction ─────────────────────────────────
  const superAdminRole = await prisma.systemRole.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  if (!superAdminRole) {
    return NextResponse.json(
      { error: 'ไม่พบบทบาท SUPER_ADMIN ในระบบ กรุณารัน Permission Seed ก่อน' },
      { status: 500 }
    );
  }

  const adminUser = await prisma.$transaction(async (tx) => {
    const existing = await tx.personnel.findFirst({
      where: {
        OR: [{ citizenId: cleanCitizenId }, { badgeNo: cleanBadgeNo }],
      },
    });

    if (existing) {
      return tx.personnel.update({
        where: { id: existing.id },
        data: {
          role: 'SUPER_ADMIN',
          password: hashedPassword,
          mustChangePassword: true,
          status: 'ปกติ',
        },
      });
    }

    return tx.personnel.create({
      data: {
        citizenId: cleanCitizenId,
        badgeNo: cleanBadgeNo,
        username: cleanCitizenId,
        password: hashedPassword,
        prefix: 'นาย',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        position: 'ผู้ดูแลระบบสูงสุด',
        department: 'สำนักเทคโนโลยีสารสนเทศ',
        subDepartment: 'ฝ่ายพัฒนาระบบและโครงสร้างพื้นฐาน',
        personnelType: 'นายทหารสัญญาบัตร',
        phone: '02-000-0000',
        mobile: '080-000-0000',
        email: 'superadmin@system.local',
        role: 'SUPER_ADMIN',
        status: 'ปกติ',
        avatarColor: '#3b82f6',
        mustChangePassword: true,
      },
    });
  });

  await prisma.auditLog.create({
    data: {
      personnelId: adminUser.id,
      action: 'SETUP_ADMIN_SUCCESS',
      entity: 'Personnel',
      entityId: adminUser.id,
      details: JSON.stringify({ ip, role: 'SUPER_ADMIN', username: adminUser.username }),
      ipAddress: ip,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: 'สร้างบัญชีผู้ดูแลระบบสูงสุด (SUPER_ADMIN) สำเร็จ',
    user: {
      id: adminUser.id,
      username: adminUser.username,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      defaultPasswordHint: 'รหัสผ่านเริ่มต้นคือเลข 4 หลักสุดท้ายของบัตรประชาชน',
    },
  });
}

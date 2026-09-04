import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import rateLimit from '@/lib/rate-limit';

const ADMIN_SECRET_CODE = process.env.ADMIN_SETUP_SECRET;

const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 200,
});

/**
 * POST /api/auth/setup-admin
 *
 * Security rules:
 * 1. Permanently disabled (410 Gone) once isInstalled = true.
 * 2. Strict rate-limit: 5 attempts per IP per 15 minutes.
 * 3. Requires ADMIN_SETUP_SECRET env var — rejects if not configured.
 * 4. Logs every attempt (successful or not) to AuditLog.
 */
export async function POST(req: Request) {
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
          action:      'SETUP_ADMIN_BLOCKED',
          entity:      'Personnel',
          entityId:    'setup-admin',
          details:     JSON.stringify({ reason: 'post-install attempt', ip }),
          ipAddress:   ip,
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
  const cleanBadgeNo   = String(badgeNo).trim();

  if (!/^\d{13}$/.test(cleanCitizenId)) {
    return NextResponse.json(
      { error: 'เลขประจำตัวประชาชน (13 หลัก) ต้องเป็นตัวเลขล้วน 13 หลักเท่านั้น' },
      { status: 400 }
    );
  }

  if (!/^\d{10}$/.test(cleanBadgeNo)) {
    return NextResponse.json(
      { error: 'หมายเลขประจำตัวทหาร/เจ้าหน้าที่ (10 หลัก) ต้องเป็นตัวเลขล้วน 10 หลักเท่านั้น' },
      { status: 400 }
    );
  }

  if (secretCode !== ADMIN_SECRET_CODE) {
    await prisma.auditLog.create({
      data: {
        personnelId: 'SYSTEM',
        action:      'SETUP_ADMIN_FAILED',
        entity:      'Personnel',
        entityId:    'setup-admin',
        details:     JSON.stringify({ reason: 'wrong secret', ip }),
        ipAddress:   ip,
      },
    }).catch(() => {});

    return NextResponse.json({ error: 'รหัสลับไม่ถูกต้อง (Invalid Secret Code)' }, { status: 403 });
  }

  // ── Create / promote admin ───────────────────────────────────────────────
  try {
    let person = await prisma.personnel.findFirst({
      where: { OR: [{ citizenId: cleanCitizenId }, { badgeNo: cleanBadgeNo }] },
    });

    const passwordHash = await bcrypt.hash(cleanBadgeNo, 12);

    if (person) {
      // Only promote — do NOT allow demoting an existing SUPER_ADMIN
      if (person.role === 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Cannot modify a SUPER_ADMIN account via this endpoint.' },
          { status: 403 }
        );
      }
      person = await prisma.personnel.update({
        where: { id: person.id },
        data:  { role: 'ADMIN', password: passwordHash },
      });
    } else {
      person = await prisma.personnel.create({
        data: {
          citizenId:     cleanCitizenId,
          badgeNo:       cleanBadgeNo,
          username:      cleanCitizenId,
          password:      passwordHash,
          role:          'ADMIN',
          prefix:        'นาย',
          firstName:     String(firstName).trim(),
          lastName:      String(lastName).trim(),
          position:      'ผู้ดูแลระบบ (System Admin)',
          department:    'กองเทคโนโลยีสารสนเทศ',
          subDepartment: '-',
          personnelType: 'นายทหารสัญญาบัตร',
          phone:         '-',
          mobile:        '-',
          email:         `${cleanCitizenId}@rta.mi.th`,
          status:        'ปฏิบัติงานปกติ',
          avatarColor:   '#f43f5e',
          skills:        '[]',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        personnelId: person.id,
        action:      'SETUP_ADMIN_SUCCESS',
        entity:      'Personnel',
        entityId:    person.id,
        details:     JSON.stringify({ ip }),
        ipAddress:   ip,
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Admin setup successful' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

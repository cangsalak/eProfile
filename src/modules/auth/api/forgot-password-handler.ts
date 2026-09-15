import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma, forgotPasswordLookupSchema, forgotPasswordVerifySchema } from '@/modules/core';

function maskString(str: string): string {
  if (!str) return '';
  if (str.length <= 2) return str.charAt(0) + '*';
  return str.charAt(0) + '*'.repeat(Math.max(2, str.length - 2)) + str.charAt(str.length - 1);
}

export async function handleForgotPassword(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'lookup';

    // ── 1. Action: Account Lookup ──────────────────────────────────────────────
    if (action === 'lookup') {
      const parsed = forgotPasswordLookupSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
      }

      const { username } = parsed.data;

      const person = await prisma.personnel.findFirst({
        where: {
          OR: [
            { username: username },
            { citizenId: username },
            { badgeNo: username },
            { officialId: username },
          ],
        },
        select: {
          id: true,
          prefix: true,
          firstName: true,
          lastName: true,
          department: true,
          subDepartment: true,
          citizenId: true,
          phone: true,
          mobile: true,
          email: true,
        },
      });

      // Audit the lookup attempt
      await prisma.auditLog.create({
        data: {
          personnelId: person?.id || 'ANONYMOUS',
          action: 'PASSWORD_RESET_LOOKUP',
          entity: 'Personnel',
          entityId: person?.id || username,
          details: JSON.stringify({ username, found: !!person, ip }),
          ipAddress: ip,
        },
      }).catch(() => {});

      if (!person) {
        return NextResponse.json({
          error: 'ไม่พบข้อมูลบัญชีผู้ใช้งานในระบบ กรุณาตรวจสอบรหัสบัตรประชาชน หรือชื่อผู้ใช้',
        }, { status: 404 });
      }

      // Return masked summary only — NO raw citizen ID, phone, or email leaked
      return NextResponse.json({
        success: true,
        found: true,
        maskedName: `${person.prefix || ''} ${person.firstName} ${maskString(person.lastName)}`.trim(),
        department: person.department,
        subDepartment: person.subDepartment,
        hasPhone: !!(person.phone || person.mobile),
        hasEmail: !!person.email,
        hasCitizenId: !!person.citizenId,
      });
    }

    // ── 2. Action: Identity Verification & Token Issue ─────────────────────────
    if (action === 'verify') {
      const parsed = forgotPasswordVerifySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลการยืนยันตัวตนไม่ถูกต้อง' }, { status: 400 });
      }

      const { username, citizenId, phone } = parsed.data;

      const person = await prisma.personnel.findFirst({
        where: {
          OR: [
            { username: username },
            { citizenId: username },
            { badgeNo: username },
            { officialId: username },
          ],
        },
      });

      if (!person) {
        return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้งาน' }, { status: 404 });
      }

      // Check Citizen ID match
      if (person.citizenId !== citizenId) {
        await prisma.auditLog.create({
          data: {
            personnelId: person.id,
            action: 'PASSWORD_RESET_VERIFY_FAILED',
            entity: 'Personnel',
            entityId: person.id,
            details: JSON.stringify({ reason: 'citizenId mismatch', ip }),
            ipAddress: ip,
          },
        }).catch(() => {});

        return NextResponse.json({
          error: 'ข้อมูลเลขประจำตัวประชาชน 13 หลักไม่ตรงกับข้อมูลในระบบ',
        }, { status: 400 });
      }

      // Check phone match if provided
      if (phone) {
        const cleanPhoneInput = phone.replace(/[-\s]/g, '');
        const cleanPersonPhone = (person.phone || '').replace(/[-\s]/g, '');
        const cleanPersonMobile = (person.mobile || '').replace(/[-\s]/g, '');

        if (cleanPhoneInput !== cleanPersonPhone && cleanPhoneInput !== cleanPersonMobile) {
          return NextResponse.json({
            error: 'เบอร์โทรศัพท์ที่ระบุไม่ตรงกับข้อมูลในระบบ',
          }, { status: 400 });
        }
      }

      // Generate a cryptographically secure 64-char reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

      // Invalidate existing active tokens for this personnel and insert new one
      await prisma.passwordResetToken.deleteMany({
        where: { personnelId: person.id },
      }).catch(() => {});

      await prisma.passwordResetToken.create({
        data: {
          token,
          personnelId: person.id,
          expiresAt,
        },
      });

      // Audit successful verification
      await prisma.auditLog.create({
        data: {
          personnelId: person.id,
          action: 'PASSWORD_RESET_TOKEN_ISSUED',
          entity: 'Personnel',
          entityId: person.id,
          details: JSON.stringify({ expiresAt: expiresAt.toISOString(), ip }),
          ipAddress: ip,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        verified: true,
        resetToken: token,
        expiresInSeconds: 900,
        message: 'ยืนยันตัวตนสำเร็จ กรุณากำหนดรหัสผ่านใหม่ภายใน 15 นาที',
      });
    }

    // ── 3. Action: Admin Help Request Fallback ─────────────────────────────────
    if (action === 'request-admin') {
      const { username, note, contactBack } = body;
      if (!username) {
        return NextResponse.json({ error: 'กรุณาระบุชื่อผู้ใช้หรือเลขบัตรประชาชน' }, { status: 400 });
      }

      const person = await prisma.personnel.findFirst({
        where: {
          OR: [
            { username },
            { citizenId: username },
            { badgeNo: username },
          ],
        },
      });

      // Create an audit notification record for admins to see in System Inspector
      await prisma.auditLog.create({
        data: {
          personnelId: person?.id || 'ANONYMOUS',
          action: 'PASSWORD_RESET_ADMIN_REQUESTED',
          entity: 'Personnel',
          entityId: person?.id || username,
          details: JSON.stringify({
            username,
            personnelName: person ? `${person.prefix || ''} ${person.firstName} ${person.lastName}`.trim() : 'ไม่พบข้อมูล',
            department: person?.department || '-',
            contactBack: contactBack || '-',
            note: note || '-',
            ip,
          }),
          ipAddress: ip,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'ส่งคำขอไปยังผู้ดูแลระบบเรียบร้อยแล้ว ผู้ดูแลระบบจะติดต่อกลับเพื่อช่วยรีเซ็ตรหัสผ่าน',
      });
    }

    return NextResponse.json({ error: 'Action ไม่ถูกต้อง' }, { status: 400 });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการทำรายการ กรุณาลองใหม่' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordLookupSchema, forgotPasswordVerifySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

function maskString(str: string): string {
  if (!str) return '';
  if (str.length <= 2) return str.charAt(0) + '*';
  return str.charAt(0) + '*'.repeat(Math.max(2, str.length - 2)) + str.charAt(str.length - 1);
}

/**
 * POST /api/auth/forgot-password
 * Handles:
 * 1. Account Lookup (finds user and returns masked identity safely)
 * 2. Identity Verification (verifies citizenId / phone / email and generates a secure Reset Token)
 * 3. Admin Request Fallback (creates a notification/message for manual admin reset)
 */
export async function POST(req: Request) {
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
          personnelId: person?.id ?? null,
          action: 'PASSWORD_RESET_LOOKUP',
          entity: 'Personnel',
          entityId: person?.id ?? 'UNKNOWN',
          details: JSON.stringify({ username, found: !!person }),
          ipAddress: ip,
        },
      }).catch(() => {});

      if (!person) {
        return NextResponse.json({
          success: false,
          found: false,
          error: 'ไม่พบข้อมูลบัญชีผู้ใช้งานที่ระบุในระบบ กรุณาตรวจสอบความถูกต้อง',
        }, { status: 404 });
      }

      const maskedName = `${person.prefix || ''}${maskString(person.firstName)} ${maskString(person.lastName)}`.trim();
      const hasPhone = !!(person.phone || person.mobile);
      const hasEmail = !!person.email;
      const hasCitizenId = !!person.citizenId;

      return NextResponse.json({
        success: true,
        found: true,
        maskedName,
        department: person.department || '-',
        subDepartment: person.subDepartment || '-',
        hasPhone,
        hasEmail,
        hasCitizenId,
      });
    }

    // ── 2. Action: Identity Verification & Token Generation ────────────────────
    if (action === 'verify') {
      const parsed = forgotPasswordVerifySchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
      }

      const { username, citizenId, phone, email } = parsed.data;

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
        return NextResponse.json({ success: false, error: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
      }

      // Check verification inputs
      let isMatch = false;

      // 1) Verify citizenId (exact 13 digits or matching stored citizenId)
      if (citizenId && person.citizenId) {
        const cleanInput = citizenId.replace(/\D/g, '');
        const cleanStored = person.citizenId.replace(/\D/g, '');
        if (cleanInput.length >= 4 && (cleanStored === cleanInput || cleanStored.endsWith(cleanInput))) {
          isMatch = true;
        }
      }

      // 2) Verify phone/mobile
      if (!isMatch && phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        const cleanStoredPhone = (person.phone || '').replace(/\D/g, '');
        const cleanStoredMobile = (person.mobile || '').replace(/\D/g, '');
        if (cleanPhone.length >= 4 && (
          (cleanStoredPhone && cleanStoredPhone.endsWith(cleanPhone)) ||
          (cleanStoredMobile && cleanStoredMobile.endsWith(cleanPhone))
        )) {
          isMatch = true;
        }
      }

      // 3) Verify email
      if (!isMatch && email && person.email) {
        if (email.trim().toLowerCase() === person.email.trim().toLowerCase()) {
          isMatch = true;
        }
      }

      if (!isMatch) {
        await prisma.auditLog.create({
          data: {
            personnelId: person.id,
            action: 'PASSWORD_RESET_VERIFY_FAILED',
            entity: 'Personnel',
            entityId: person.id,
            details: JSON.stringify({ reason: 'Verification criteria did not match' }),
            ipAddress: ip,
          },
        }).catch(() => {});

        return NextResponse.json({
          success: false,
          error: 'ข้อมูลยืนยันตัวตน (เลขบัตรประชาชน / เบอร์โทรศัพท์ / อีเมล) ไม่ตรงกับข้อมูลในระบบ กรุณาตรวจสอบอีกครั้ง',
        }, { status: 400 });
      }

      // Generate a secure crypto token valid for 15 minutes
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Clean up previous tokens for this user and create new token
      await prisma.passwordResetToken.deleteMany({
        where: { personnelId: person.id },
      });

      await prisma.passwordResetToken.create({
        data: {
          personnelId: person.id,
          token: resetToken,
          expiresAt,
        },
      });

      await prisma.auditLog.create({
        data: {
          personnelId: person.id,
          action: 'PASSWORD_RESET_TOKEN_ISSUED',
          entity: 'Personnel',
          entityId: person.id,
          details: JSON.stringify({ expiresAt }),
          ipAddress: ip,
        },
      }).catch(() => {});

      return NextResponse.json({
        success: true,
        verified: true,
        resetToken,
        expiresInMinutes: 15,
        message: 'ยืนยันตัวตนสำเร็จ ท่านสามารถกำหนดรหัสผ่านใหม่ได้ทันที',
      });
    }

    // ── 3. Action: Request Admin Help ──────────────────────────────────────────
    if (action === 'request-admin') {
      const { username, note } = body;
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

      if (person) {
        await prisma.contactMessage.create({
          data: {
            name: `แจ้งลืมรหัสผ่าน: ${person.prefix || ''}${person.firstName} ${person.lastName}`,
            email: person.email || 'system@internal',
            phone: person.phone || person.mobile || '',
            message: `ผู้ใช้ ${person.username} (${person.prefix || ''}${person.firstName} ${person.lastName} สังกัด ${person.department || '-'}) แจ้งลืมรหัสผ่านและขอความช่วยเหลือจากผู้ดูแลระบบ ${note ? `\nหมายเหตุ: ${note}` : ''}`,
            status: 'unread',
          },
        });

        await prisma.auditLog.create({
          data: {
            personnelId: person.id,
            action: 'PASSWORD_RESET_ADMIN_REQUESTED',
            entity: 'Personnel',
            entityId: person.id,
            details: JSON.stringify({ note }),
            ipAddress: ip,
          },
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: 'ส่งคำขอความช่วยเหลือไปยังผู้ดูแลระบบเรียบร้อยแล้ว แอดมินจะดำเนินการตรวจสอบให้โดยเร็ว',
      });
    }

    return NextResponse.json({ error: 'Action ไม่ถูกต้อง' }, { status: 400 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

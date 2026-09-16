import { NextResponse } from 'next/server';
import { prisma, rateLimit } from '@/modules/core';
import { requireRole } from '@/modules/core';
import { contactSchema } from '@/modules/core';

const contactRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 200,
});

export async function handleGetContacts(req: Request) {
  try {
    const { error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError) return authError;

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function handleCreateContact(req: Request) {
  try {
    // 1. Rate limiting check (Max 5 inquiries per minute per IP)
    const res = NextResponse.next();
    try {
      await contactRateLimiter.check(res, 5, 'CONTACT_SUBMIT');
    } catch {
      return NextResponse.json(
        { error: 'คุณส่งข้อความติดต่อถี่เกินกำหนด กรุณารอ 1 นาทีแล้วลองใหม่อีกครั้ง (Rate limit exceeded)' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // 2. Bot & Spam Honeypot check
    if (body.website || body._gotcha || body.honeypot) {
      return NextResponse.json(
        { error: 'ระบบตรวจพบพฤติกรรมสแปมหรือบอทอัตโนมัติ ไม่อนุญาตให้ส่งข้อความ (Bot / Spam Detected)' },
        { status: 400 }
      );
    }

    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json({ error: firstIssue?.message || 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบการกรอกข้อมูล' }, { status: 400 });
    }

    const { name, email, phone, message } = validation.data;

    const contactMsg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    // Notify Admins
    await prisma.notification.create({
      data: {
        personnelId: 'ADMIN',
        title: `ข้อความติดต่อใหม่จากคุณ ${name}`,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        type: 'info',
        link: '/manage/contacts',
      },
    }).catch(() => {});

    return NextResponse.json(contactMsg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit contact message' }, { status: 500 });
  }
}

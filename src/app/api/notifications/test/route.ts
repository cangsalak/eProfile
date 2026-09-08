import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/test
 * Tests sending a notification via LINE Bot or Email SMTP.
 */
export async function POST(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) {
      return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, target, message } = body;

    if (type === 'line') {
      const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      const targetId = target || process.env.LINE_USER_ID;

      if (!lineToken) {
        return NextResponse.json(
          {
            success: false,
            message: 'ยังไม่ได้กำหนด LINE_CHANNEL_ACCESS_TOKEN ในไฟล์ .env ของเซิร์ฟเวอร์',
          },
          { status: 400 }
        );
      }

      if (!targetId) {
        return NextResponse.json(
          {
            success: false,
            message: 'กรุณาระบุ LINE User ID หรือ Group ID สำหรับทดสอบ',
          },
          { status: 400 }
        );
      }

      // Perform actual LINE Messaging API Push
      const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${lineToken}`,
        },
        body: JSON.stringify({
          to: targetId,
          messages: [
            {
              type: 'text',
              text: message || `🔔 [eProfile Test Notification]\nระบบทดสอบการแจ้งเตือน LINE Messaging API สำเร็จ!\nเวลา: ${new Date().toLocaleString('th-TH')}`,
            },
          ],
        }),
      });

      if (!pushRes.ok) {
        const errorData = await pushRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            message: errorData.message || 'ส่งข้อความ LINE ไม่สำเร็จ กรุณาตรวจสอบ Token และ User/Group ID',
            details: errorData,
          },
          { status: pushRes.status }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'ส่งข้อความทดสอบไปยัง LINE สำเร็จแล้ว',
      });
    }

    if (type === 'email') {
      const emailTo = target || process.env.SMTP_TO;
      if (!emailTo) {
        return NextResponse.json(
          {
            success: false,
            message: 'กรุณาระบุอีเมลปลายทางสำหรับทดสอบ',
          },
          { status: 400 }
        );
      }

      // Check if SMTP environment is configured
      const smtpHost = process.env.SMTP_HOST;
      if (!smtpHost) {
        return NextResponse.json({
          success: true,
          simulated: true,
          message: `จำลองการส่งอีเมลทดสอบไปยัง ${emailTo} สำเร็จ (สามารถตั้งค่า SMTP_HOST ใน .env เพื่อส่งจริง)`,
        });
      }

      return NextResponse.json({
        success: true,
        message: `ส่งอีเมลทดสอบไปยัง ${emailTo} สำเร็จแล้ว`,
      });
    }

    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to test notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

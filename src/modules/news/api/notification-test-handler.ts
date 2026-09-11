import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-guards';
import nodemailer from 'nodemailer';

export async function handleTestNotification(req: Request) {
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
            message: 'ยังไม่ได้กำหนด LINE_CHANNEL_ACCESS_TOKEN ในการตั้งค่าระบบหรือไฟล์ .env',
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

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || 'eProfile System <noreply@eprofile.local>';

      if (!smtpHost) {
        return NextResponse.json({
          success: true,
          simulated: true,
          message: `จำลองการส่งอีเมลทดสอบไปยัง ${emailTo} สำเร็จ (สามารถตั้งค่า SMTP_HOST ใน .env เพื่อส่งจริง)`,
        });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: emailTo,
        subject: '[eProfile Test] ทดสอบการส่งอีเมลแจ้งเตือน',
        html: `
          <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #4f46e5;">🔔 ทดสอบการแจ้งเตือนอีเมล (eProfile System)</h2>
            <p style="color: #334155; font-size: 15px;">ระบบสามารถเชื่อมต่อและส่งอีเมลแจ้งเตือนผ่านเซิร์ฟเวอร์ SMTP ได้สำเร็จเรียบร้อยแล้ว</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px;">ส่งเมื่อ: ${new Date().toLocaleString('th-TH')}</p>
          </div>
        `,
      });

      return NextResponse.json({
        success: true,
        message: `ส่งอีเมลทดสอบไปยัง ${emailTo} สำเร็จแล้ว`,
      });
    }

    return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to test notification' }, { status: 500 });
  }
}

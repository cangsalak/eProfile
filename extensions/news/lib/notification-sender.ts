import { prisma } from '@/modules/core';
import nodemailer from 'nodemailer';

export interface SendNotificationOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  targetType?: 'ALL' | 'ADMIN' | 'USER';
  targetPersonnelId?: string;
  link?: string;
  channels?: ('in_app' | 'line' | 'email')[];
  senderId?: string;
}

export async function sendNotification(options: SendNotificationOptions) {
  const {
    title,
    message,
    type = 'info',
    targetType = 'ALL',
    targetPersonnelId,
    link,
    channels = ['in_app'],
    senderId,
  } = options;

  const results: { in_app?: boolean; line?: boolean; email?: boolean; error?: string } = {};

  // 1. In-App Notification (Database)
  if (channels.includes('in_app')) {
    try {
      const targetId = targetType === 'USER' && targetPersonnelId ? targetPersonnelId : targetType;
      await prisma.notification.create({
        data: {
          personnelId: targetId,
          title,
          message,
          type,
          link: link || null,
        },
      });
      results.in_app = true;
    } catch (err: any) {
      console.error('Failed to create in-app notification', err);
      results.error = err.message;
    }
  }

  // 2. LINE Messaging API Push
  if (channels.includes('line')) {
    try {
      const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      const targetId = process.env.LINE_USER_ID;

      if (lineToken && targetId) {
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
                text: `📢 [${title}]\n${message}${link ? `\n\n🔗 ดูรายละเอียด: ${link}` : ''}`,
              },
            ],
          }),
        });
        results.line = pushRes.ok;
      }
    } catch (err: any) {
      console.error('Failed to send LINE notification', err);
    }
  }

  // 3. Email SMTP Notification
  if (channels.includes('email')) {
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || 'eProfile System <noreply@eprofile.local>';
      const smtpTo = process.env.SMTP_TO;

      if (smtpHost && smtpTo) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
        });

        await transporter.sendMail({
          from: smtpFrom,
          to: smtpTo,
          subject: `[eProfile] ${title}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px;">
              <h2 style="color: #0f172a; margin-bottom: 12px;">${title}</h2>
              <p style="color: #334155; font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
              ${link ? `<div style="margin-top: 20px;"><a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">ดูรายละเอียดในระบบ</a></div>` : ''}
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">ระบบทะเบียนประวัติและบริหารจัดการกำลังพล (eProfile System)</p>
            </div>
          `,
        });
        results.email = true;
      }
    } catch (err: any) {
      console.error('Failed to send email notification', err);
    }
  }

  return results;
}

// ── Legacy helpers (backward-compat) ──────────────────────────────────────────
// Kept so that personnel and other modules can import from here
// instead of the removed src/lib/notifications.ts

/** @deprecated Use sendNotification({ channels: ['line'] }) instead */
export async function sendLineNotify(message: string) {
  try {
    const enableLineSetting = await prisma.systemSetting.findUnique({ where: { key: 'enableLineNotify' } });
    if (enableLineSetting?.value !== 'true') return;

    const tokenSetting = await prisma.systemSetting.findUnique({ where: { key: 'lineNotifyToken' } });
    const token = tokenSetting?.value;
    if (!token) return;

    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      },
      body: new URLSearchParams({ message }),
    });

    if (!res.ok) console.error('LINE Notify Error:', await res.text());
  } catch (error) {
    console.error('Failed to send LINE Notify:', error);
  }
}

/** @deprecated Use sendNotification({ channels: ['email'] }) instead */
export async function sendEmailNotification(subject: string, text: string) {
  try {
    const enableEmailSetting = await prisma.systemSetting.findUnique({ where: { key: 'enableEmailNotify' } });
    if (enableEmailSetting?.value !== 'true') return;

    const host = await prisma.systemSetting.findUnique({ where: { key: 'smtpHost' } });
    const port = await prisma.systemSetting.findUnique({ where: { key: 'smtpPort' } });
    const user = await prisma.systemSetting.findUnique({ where: { key: 'smtpUser' } });
    const pass = await prisma.systemSetting.findUnique({ where: { key: 'smtpPass' } });
    const to   = await prisma.systemSetting.findUnique({ where: { key: 'notifyEmailTo' } });

    if (!host?.value || !user?.value || !pass?.value || !to?.value) return;

    const transporter = nodemailer.createTransport({
      host: host.value,
      port: parseInt(port?.value || '587'),
      secure: parseInt(port?.value || '587') === 465,
      auth: { user: user.value, pass: pass.value },
    });

    const systemNameSetting = await prisma.systemSetting.findUnique({ where: { key: 'systemName' } });
    const sysName = systemNameSetting?.value || 'ระบบฐานข้อมูลบุคลากร';

    await transporter.sendMail({
      from: `"${sysName}" <${user.value}>`,
      to: to.value,
      subject,
      text,
    });
  } catch (error) {
    console.error('Failed to send Email:', error);
  }
}

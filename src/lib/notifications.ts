import { prisma } from './prisma';
import nodemailer from 'nodemailer';

export async function sendLineNotify(message: string) {
  try {
    const enableLineSetting = await prisma.systemSetting.findUnique({ where: { key: 'enableLineNotify' } });
    if (enableLineSetting?.value !== 'true') return; // Disabled

    const tokenSetting = await prisma.systemSetting.findUnique({ where: { key: 'lineNotifyToken' } });
    const token = tokenSetting?.value;
    
    if (!token) return;

    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: new URLSearchParams({ message })
    });

    if (!res.ok) {
      console.error('LINE Notify Error:', await res.text());
    }
  } catch (error) {
    console.error('Failed to send LINE Notify:', error);
  }
}

export async function sendEmailNotification(subject: string, text: string) {
  try {
    const enableEmailSetting = await prisma.systemSetting.findUnique({ where: { key: 'enableEmailNotify' } });
    if (enableEmailSetting?.value !== 'true') return;

    const host = await prisma.systemSetting.findUnique({ where: { key: 'smtpHost' } });
    const port = await prisma.systemSetting.findUnique({ where: { key: 'smtpPort' } });
    const user = await prisma.systemSetting.findUnique({ where: { key: 'smtpUser' } });
    const pass = await prisma.systemSetting.findUnique({ where: { key: 'smtpPass' } });
    const to = await prisma.systemSetting.findUnique({ where: { key: 'notifyEmailTo' } });

    if (!host?.value || !user?.value || !pass?.value || !to?.value) return;

    const transporter = nodemailer.createTransport({
      host: host.value,
      port: parseInt(port?.value || '587'),
      secure: parseInt(port?.value || '587') === 465,
      auth: {
        user: user.value,
        pass: pass.value
      }
    });

    const settings = await prisma.systemSetting.findFirst();
    const systemNameSetting = await prisma.systemSetting.findUnique({ where: { key: "systemName" } });
    const sysName = systemNameSetting?.value || 'ระบบฐานข้อมูลบุคลากร';

    await transporter.sendMail({
      from: `"${sysName}" <${user.value}>`,
      to: to.value,
      subject,
      text
    });
  } catch (error) {
    console.error('Failed to send Email:', error);
  }
}

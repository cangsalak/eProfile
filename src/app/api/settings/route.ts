import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert array to key-value object
    const settingsObj = settings.reduce((acc: any, curr) => {
      // Do not return sensitive information that might still be in DB
      if (['smtpPass', 'lineNotifyToken', 'smtpUser', 'smtpHost', 'smtpPort'].includes(curr.key)) {
        return acc;
      }
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Save each setting to the DB using upsert
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

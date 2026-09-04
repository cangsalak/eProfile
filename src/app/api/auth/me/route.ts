import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const person = await prisma.personnel.findUnique({
      where: { id: authUser.id },
    });

    if (!person) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Exclude password
    const { password: _, ...userProfile } = person;

    // Fetch permissions from SystemRole
    let permissions: string[] = [];
    const systemRole = await prisma.systemRole.findUnique({
      where: { name: person.role },
    });

    if (systemRole) {
      try {
        permissions = JSON.parse(systemRole.permissions || '[]');
      } catch (e) {
        console.error('Failed to parse permissions', e);
      }
    }

    let skills: string[] = [];
    try {
      skills = JSON.parse(person.skills || '[]');
    } catch {
      skills = [];
    }

    return NextResponse.json({
      user: {
        ...userProfile,
        skills,
        permissions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}

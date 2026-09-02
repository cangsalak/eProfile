import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { z } from 'zod';

// ─── Validation schema ────────────────────────────────────────────────────────

const VALID_LEAVE_TYPES = [
  'ลาพักผ่อน', 'ลากิจ', 'ลาป่วย',
  'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ',
] as const;

const VALID_STATUSES = ['รออนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'ยกเลิก'] as const;

const CreateLeaveSchema = z.object({
  personnelId:          z.string().min(1).optional(), // overridden for normal users
  leaveType:            z.enum(VALID_LEAVE_TYPES),
  startDate:            z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate:              z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  reason:               z.string().max(1000).optional().default(''),
  writtenAt:            z.string().max(200).optional().default(''),
  toPerson:             z.string().max(200).optional().default(''),
  contactAddress:       z.string().max(500).optional().default(''),
  contactTambon:        z.string().max(100).optional().default(''),
  contactAmphoe:        z.string().max(100).optional().default(''),
  contactProvince:      z.string().max(100).optional().default(''),
  substitutePerson:     z.string().max(200).optional().nullable(),
  accumulatedLeaveDays: z.number().nonnegative().optional().nullable(),
  thisYearLeaveDays:    z.number().nonnegative().optional().nullable(),
  ordainedBefore:       z.boolean().optional().default(false),
  ordainTempleName:     z.string().max(200).optional().nullable(),
  ordainTempleLocation: z.string().max(200).optional().nullable(),
  ordainDate:           z.string().optional().nullable(),
  stayTempleName:       z.string().max(200).optional().nullable(),
  stayTempleLocation:   z.string().max(200).optional().nullable(),
  maternityLeaveTimes:  z.number().int().nonnegative().optional().nullable(),
  maternityLeaveDays:   z.number().int().nonnegative().optional().nullable(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when the user has elevated leave/personnel permissions */
async function hasElevatedLeavePermission(req: Request, role: string): Promise<boolean> {
  if (role === 'SUPER_ADMIN') return true;
  const { error } = await requirePermission(req, 'APPROVE_LEAVE');
  if (!error) return true;
  const { error: err2 } = await requirePermission(req, 'MANAGE_PERSONNEL');
  return !err2;
}

// ─── GET /api/leaves ──────────────────────────────────────────────────────────
/**
 * Authorization:
 * - Unauthenticated → 401
 * - Normal user     → own leaves only
 * - APPROVE_LEAVE / MANAGE_PERSONNEL / SUPER_ADMIN → all leaves
 */
export async function GET(req: Request) {
  const { user, error: authError } = await requireAuth(req);
  if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const queryPersonnelId = searchParams.get('personnelId');

    const elevated = await hasElevatedLeavePermission(req, user.role);

    if (elevated) {
      // Privileged: return filtered set or all
      const where = queryPersonnelId ? { personnelId: queryPersonnelId } : {};
      const leaves = await prisma.leaveRecord.findMany({
        where,
        orderBy: { startDate: 'desc' },
        include: {
          personnel: {
            select: { prefix: true, firstName: true, lastName: true, position: true, department: true },
          },
        },
      });
      return NextResponse.json(leaves);
    }

    // Normal user: always their own records regardless of query param
    const leaves = await prisma.leaveRecord.findMany({
      where: { personnelId: user.id },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(leaves);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leaves';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/leaves ─────────────────────────────────────────────────────────
/**
 * Authorization:
 * - Must be authenticated.
 * - Normal users: `personnelId` is forced to their own JWT id; `status` is hardcoded to 'รออนุมัติ'.
 * - MANAGE_PERSONNEL: may specify a different `personnelId` (create on behalf).
 * - Nobody can set a status other than 'รออนุมัติ' on creation.
 */
export async function POST(req: Request) {
  const { user, error: authError } = await requireAuth(req);
  if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Validate shape
  const parsed = CreateLeaveSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const body = parsed.data;

  // Validate date order
  const startDate = new Date(body.startDate);
  const endDate   = new Date(body.endDate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
  }
  if (endDate < startDate) {
    return NextResponse.json({ error: 'endDate must be on or after startDate.' }, { status: 400 });
  }

  // Determine effective personnelId
  let effectivePersonnelId = user.id;

  if (body.personnelId && body.personnelId !== user.id) {
    // Only MANAGE_PERSONNEL can create leaves on behalf of others
    const { error: permErr } = await requirePermission(req, 'MANAGE_PERSONNEL');
    if (permErr) {
      return NextResponse.json(
        { error: 'You can only create leave records for yourself.' },
        { status: 403 }
      );
    }
    effectivePersonnelId = body.personnelId;
  }

  // Verify the target personnel exists
  const target = await prisma.personnel.findUnique({
    where:  { id: effectivePersonnelId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'Personnel not found.' }, { status: 404 });
  }

  try {
    const accDays   = body.accumulatedLeaveDays ?? null;
    const yearDays  = body.thisYearLeaveDays ?? null;
    const totalDays = accDays !== null && yearDays !== null ? accDays + yearDays : null;

    const leave = await prisma.leaveRecord.create({
      data: {
        personnelId:          effectivePersonnelId,
        leaveType:            body.leaveType,
        startDate,
        endDate,
        reason:               body.reason ?? '',
        writtenAt:            body.writtenAt ?? '',
        toPerson:             body.toPerson ?? '',
        contactAddress:       body.contactAddress ?? '',
        contactTambon:        body.contactTambon ?? '',
        contactAmphoe:        body.contactAmphoe ?? '',
        contactProvince:      body.contactProvince ?? '',
        // ⚠️ Status is ALWAYS forced to 'รออนุมัติ' on creation — never trusted from body
        status:               'รออนุมัติ',
        substitutePerson:     body.substitutePerson ?? null,
        accumulatedLeaveDays: accDays,
        thisYearLeaveDays:    yearDays,
        totalLeaveDays:       totalDays,
        ordainedBefore:       body.ordainedBefore ?? false,
        ordainTempleName:     body.ordainTempleName ?? null,
        ordainTempleLocation: body.ordainTempleLocation ?? null,
        ordainDate:           body.ordainDate ? new Date(body.ordainDate) : null,
        stayTempleName:       body.stayTempleName ?? null,
        stayTempleLocation:   body.stayTempleLocation ?? null,
        maternityLeaveTimes:  body.maternityLeaveTimes ?? null,
        maternityLeaveDays:   body.maternityLeaveDays ?? null,
      },
    });

    // Notify admin
    await prisma.notification.create({
      data: {
        personnelId: 'ADMIN',
        title:       `มีคำร้องขอ${body.leaveType}ใหม่`,
        message:     `${target.firstName} ${target.lastName} ได้ส่งคำร้องขอ${body.leaveType}`,
        type:        'info',
        link:        '/leave',
      },
    }).catch(() => { /* non-blocking */ });

    return NextResponse.json(leave, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create leave record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

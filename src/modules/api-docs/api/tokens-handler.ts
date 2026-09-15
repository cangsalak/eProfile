import { NextResponse } from 'next/server';
import { requireRole } from '@/modules/core';
import { listApiKeys, createApiKey, setApiKeyStatus, revokeApiKey } from '../lib/api-keys';
import { z } from 'zod';

const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อระบบหรือแอปพลิเคชัน').max(100),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'OFFICER', 'EDITOR', 'USER']).optional().default('ADMIN'),
  scopes: z.array(z.string()).optional().default(['*']),
  expiresInDays: z.number().nullable().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export async function handleListApiTokens(req: Request) {
  const auth = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
  if (auth.error) return auth.error;

  try {
    const keys = await listApiKeys();
    return NextResponse.json({ success: true, data: keys });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list API tokens' },
      { status: 500 }
    );
  }
}

export async function handleCreateApiToken(req: Request) {
  const auth = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const validated = CreateApiKeySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: validated.error.format() },
        { status: 400 }
      );
    }

    const { name, role, scopes, expiresInDays } = validated.data;
    const result = await createApiKey({
      name,
      role,
      scopes,
      expiresInDays: expiresInDays || null,
      createdBy: auth.user!.id,
    });

    return NextResponse.json({
      success: true,
      message: 'สร้าง API Token สำเร็จ',
      data: result,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create API token' },
      { status: 500 }
    );
  }
}

export async function handleUpdateApiTokenStatus(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
  if (auth.error) return auth.error;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing token ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validated = UpdateStatusSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const success = await setApiKeyStatus(id, validated.data.status, auth.user!.id);
    if (!success) {
      return NextResponse.json({ error: 'API token not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `ปรับสถานะเป็น ${validated.data.status} สำเร็จ`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update API token status' },
      { status: 500 }
    );
  }
}

export async function handleDeleteApiToken(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(req, ['SUPER_ADMIN', 'ADMIN']);
  if (auth.error) return auth.error;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing token ID' }, { status: 400 });
  }

  try {
    const success = await revokeApiKey(id, auth.user!.id);
    if (!success) {
      return NextResponse.json({ error: 'API token not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'เพิกถอนและลบ API Token สำเร็จ',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete API token' },
      { status: 500 }
    );
  }
}

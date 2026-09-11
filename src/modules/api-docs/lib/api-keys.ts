import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  role: string;
  scopes: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  createdBy: string;
  lastUsedIp?: string | null;
}

const SETTING_KEY = 'system_api_tokens';

async function getStoredTokens(): Promise<ApiKeyRecord[]> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });
    if (!setting || !setting.value) return [];
    return JSON.parse(setting.value);
  } catch (error) {
    console.error('Error fetching stored API tokens:', error);
    return [];
  }
}

async function saveTokens(tokens: ApiKeyRecord[]): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(tokens) },
    create: { key: SETTING_KEY, value: JSON.stringify(tokens) },
  });
}

function hashToken(plainToken: string): string {
  return crypto.createHash('sha256').update(plainToken).digest('hex');
}

async function safePersonnelId(actorId?: string | null): Promise<string | null> {
  if (!actorId) return null;
  try {
    const user = await prisma.personnel.findUnique({
      where: { id: actorId },
      select: { id: true },
    });
    return user ? user.id : null;
  } catch {
    return null;
  }
}

/**
 * List all API Keys with masked tokens for UI display
 */
export async function listApiKeys(): Promise<Omit<ApiKeyRecord, 'keyHash'>[]> {
  const tokens = await getStoredTokens();
  const now = new Date();

  return tokens.map(t => {
    let status = t.status;
    if (t.expiresAt && new Date(t.expiresAt) < now && status === 'ACTIVE') {
      status = 'EXPIRED';
    }
    const { keyHash, ...safeRecord } = t;
    return { ...safeRecord, status };
  });
}

/**
 * Generate a new API Key with high entropy and SHA-256 hash storage
 */
export async function createApiKey(params: {
  name: string;
  role?: string;
  scopes?: string[];
  expiresInDays?: number | null;
  createdBy: string;
}): Promise<{ apiKey: Omit<ApiKeyRecord, 'keyHash'>; plainToken: string }> {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const plainToken = `ep_live_${randomBytes}`;
  const keyPrefix = `${plainToken.substring(0, 15)}...${plainToken.substring(plainToken.length - 4)}`;
  const keyHash = hashToken(plainToken);

  let expiresAt: string | null = null;
  if (params.expiresInDays && params.expiresInDays > 0) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + params.expiresInDays);
    expiresAt = expDate.toISOString();
  }

  const id = `apk_${crypto.randomBytes(8).toString('hex')}`;
  const newRecord: ApiKeyRecord = {
    id,
    name: params.name.trim(),
    keyPrefix,
    keyHash,
    role: params.role || 'ADMIN',
    scopes: params.scopes && params.scopes.length > 0 ? params.scopes : ['*'],
    status: 'ACTIVE',
    expiresAt,
    lastUsedAt: null,
    createdAt: new Date().toISOString(),
    createdBy: params.createdBy,
  };

  const tokens = await getStoredTokens();
  tokens.unshift(newRecord);
  await saveTokens(tokens);

  // Log audit event
  try {
    const validPersonnelId = await safePersonnelId(params.createdBy);
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'ApiKey',
        entityId: id,
        personnelId: validPersonnelId,
        details: JSON.stringify({
          tokenId: id,
          tokenName: params.name,
          role: newRecord.role,
          scopes: newRecord.scopes,
          expiresAt,
        }),
      },
    });
  } catch (err) {
    console.warn('Could not write audit log for API token creation:', err);
  }

  const { keyHash: _, ...safeApiKey } = newRecord;
  return { apiKey: safeApiKey, plainToken };
}

/**
 * Verify an incoming API Token (checks hash, active status, expiration, and updates lastUsedAt asynchronously)
 */
export async function verifyApiKey(plainToken: string): Promise<{
  valid: boolean;
  user?: { id: string; role: string; username: string; isApiKey: boolean; scopes: string[] };
}> {
  if (!plainToken || !plainToken.startsWith('ep_live_')) {
    return { valid: false };
  }

  const tokenHash = hashToken(plainToken);
  const tokens = await getStoredTokens();
  const foundIndex = tokens.findIndex(t => t.keyHash === tokenHash);

  if (foundIndex === -1) {
    return { valid: false };
  }

  const record = tokens[foundIndex];

  // Check status
  if (record.status !== 'ACTIVE') {
    return { valid: false };
  }

  // Check expiration
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return { valid: false };
  }

  // Asynchronously update lastUsedAt in background without blocking request
  record.lastUsedAt = new Date().toISOString();
  tokens[foundIndex] = record;
  saveTokens(tokens).catch(e => console.warn('Failed to update token lastUsedAt:', e));

  return {
    valid: true,
    user: {
      id: `apikey_${record.id}`,
      role: record.role,
      username: `API_KEY:${record.name}`,
      isApiKey: true,
      scopes: record.scopes,
    },
  };
}

/**
 * Toggle API Key status (ACTIVE / SUSPENDED)
 */
export async function setApiKeyStatus(
  id: string,
  status: 'ACTIVE' | 'SUSPENDED',
  actorId: string
): Promise<boolean> {
  const tokens = await getStoredTokens();
  const foundIndex = tokens.findIndex(t => t.id === id);
  if (foundIndex === -1) return false;

  tokens[foundIndex].status = status;
  await saveTokens(tokens);

  try {
    const validPersonnelId = await safePersonnelId(actorId);
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entity: 'ApiKey',
        entityId: id,
        personnelId: validPersonnelId,
        details: JSON.stringify({ tokenId: id, newStatus: status }),
      },
    });
  } catch (err) {
    console.warn('Could not write audit log:', err);
  }

  return true;
}

/**
 * Revoke / Delete an API Key permanently
 */
export async function revokeApiKey(id: string, actorId: string): Promise<boolean> {
  const tokens = await getStoredTokens();
  const initialLength = tokens.length;
  const filtered = tokens.filter(t => t.id !== id);

  if (filtered.length === initialLength) return false;

  await saveTokens(filtered);

  try {
    const validPersonnelId = await safePersonnelId(actorId);
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'ApiKey',
        entityId: id,
        personnelId: validPersonnelId,
        details: JSON.stringify({ tokenId: id }),
      },
    });
  } catch (err) {
    console.warn('Could not write audit log:', err);
  }

  return true;
}

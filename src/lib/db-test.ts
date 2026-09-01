import net from 'net';
import fs from 'fs';
import path from 'path';

export interface DbConnectionParams {
  provider: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  connectionString?: string;
}

export interface DbTestResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  connectionUrl?: string;
}

export function buildConnectionUrl(params: DbConnectionParams): string {
  const { provider, host = 'localhost', port, database = 'eprofile', user = 'root', password = '' } = params;

  if (params.connectionString && params.connectionString.trim() !== '') {
    return params.connectionString.trim();
  }

  if (provider === 'sqlite') {
    return `file:./${database.endsWith('.db') ? database : `${database}.db`}`;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);

  if (provider === 'postgresql') {
    const defaultPort = port || 5432;
    return `postgresql://${encodedUser}:${encodedPassword}@${host}:${defaultPort}/${database}?schema=public`;
  }

  if (provider === 'mysql') {
    const defaultPort = port || 3306;
    return `mysql://${encodedUser}:${encodedPassword}@${host}:${defaultPort}/${database}`;
  }

  return '';
}

/**
 * Test socket connectivity to a TCP host and port
 */
function testTcpConnection(host: string, port: number, timeoutMs = 4000): Promise<{ ok: boolean; latency: number; error?: string }> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    let resolved = false;

    const cleanup = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (resolved) return;
      resolved = true;
      const latency = Date.now() - startTime;
      cleanup();
      resolve({ ok: true, latency });
    });

    socket.on('timeout', () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({ ok: false, latency: 0, error: `Connection timed out after ${timeoutMs}ms (${host}:${port})` });
    });

    socket.on('error', (err: any) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({ ok: false, latency: 0, error: err?.message || `Failed to connect to ${host}:${port}` });
    });

    try {
      socket.connect(port, host);
    } catch (e: any) {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ ok: false, latency: 0, error: e?.message || 'Socket error' });
      }
    }
  });
}

/**
 * Validates and tests database connection parameters
 */
export async function testDatabaseConnection(params: DbConnectionParams): Promise<DbTestResult> {
  const startTime = Date.now();
  const connectionUrl = buildConnectionUrl(params);

  if (params.provider === 'sqlite') {
    try {
      const prismaDir = path.join(process.cwd(), 'prisma');
      if (!fs.existsSync(prismaDir)) {
        fs.mkdirSync(prismaDir, { recursive: true });
      }
      const testFilePath = path.join(prismaDir, '.write_test.tmp');
      fs.writeFileSync(testFilePath, 'ok');
      fs.unlinkSync(testFilePath);

      return {
        success: true,
        message: 'เชื่อมต่อ SQLite สำเร็จ! โฟลเดอร์ prisma/ มีสิทธิ์ในการสร้างและเขียนฐานข้อมูล',
        latencyMs: Date.now() - startTime,
        connectionUrl,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `ข้อผิดพลาดของสิทธิ์ในไฟล์ SQLite: ${err.message}`,
        connectionUrl,
      };
    }
  }

  // Parse host and port for PostgreSQL / MySQL
  const host = params.host || 'localhost';
  const defaultPort = params.provider === 'postgresql' ? 5432 : 3306;
  const port = params.port || defaultPort;

  const tcpTest = await testTcpConnection(host, port);

  if (!tcpTest.ok) {
    return {
      success: false,
      message: `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ ${params.provider.toUpperCase()} ที่ ${host}:${port} (${tcpTest.error})`,
      connectionUrl,
    };
  }

  return {
    success: true,
    message: `เชื่อมต่อเซิร์ฟเวอร์ ${params.provider.toUpperCase()} (${host}:${port}) สำเร็จ! ความเร็วตอบสนอง ${tcpTest.latency}ms`,
    latencyMs: tcpTest.latency,
    connectionUrl,
  };
}

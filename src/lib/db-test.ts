import net from 'net';
import dns from 'dns';
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

// ── CIDR Helpers ──────────────────────────────────────────────────────────────

/** Convert a dotted-decimal IPv4 string to a 32-bit integer */
function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

interface Cidr4 { base: number; mask: number }

function parseCidr4(cidr: string): Cidr4 {
  const [addr, bits] = cidr.split('/');
  const mask = bits ? (~0 << (32 - parseInt(bits, 10))) >>> 0 : 0xffffffff;
  return { base: ipv4ToInt(addr) & mask, mask };
}

function inCidr4(ip: string, cidr: Cidr4): boolean {
  return (ipv4ToInt(ip) & cidr.mask) === cidr.base;
}

/**
 * RFC 1918 + loopback + link-local + reserved IPv4 ranges that must
 * never be reachable from a public-facing connection test.
 */
const BLOCKED_CIDR4: Cidr4[] = [
  '127.0.0.0/8',    // loopback
  '10.0.0.0/8',     // RFC 1918
  '172.16.0.0/12',  // RFC 1918
  '192.168.0.0/16', // RFC 1918
  '169.254.0.0/16', // link-local / APIPA
  '100.64.0.0/10',  // CGNAT (RFC 6598)
  '192.0.0.0/24',   // IETF Protocol Assignments
  '192.0.2.0/24',   // TEST-NET-1 (RFC 5737)
  '198.51.100.0/24',// TEST-NET-2
  '203.0.113.0/24', // TEST-NET-3
  '198.18.0.0/15',  // Benchmarking (RFC 2544)
  '240.0.0.0/4',    // Reserved
  '0.0.0.0/8',      // "This" network
  '255.255.255.255/32', // broadcast
].map(parseCidr4);

const DANGEROUS_METADATA_CIDR4: Cidr4[] = [
  '169.254.0.0/16', // link-local / cloud metadata services (AWS/GCP/Azure)
  '0.0.0.0/8',      // "This" network
  '255.255.255.255/32', // broadcast
].map(parseCidr4);

/**
 * Returns true if an IPv4 address falls within any blocked range.
 */
function isBlockedIPv4(ip: string, allowPrivate = false): boolean {
  if (!net.isIPv4(ip)) return false;
  const list = allowPrivate ? DANGEROUS_METADATA_CIDR4 : BLOCKED_CIDR4;
  return list.some(cidr => inCidr4(ip, cidr));
}

/**
 * Returns true if an IPv6 address is loopback, link-local, or unique-local.
 */
function isBlockedIPv6(ip: string, allowPrivate = false): boolean {
  // Normalise: strip brackets
  const h = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (allowPrivate) {
    if (h.startsWith('fe80:')) return true; // link-local
    return false;
  }
  if (h === '::1') return true;                  // loopback
  if (h === '::') return true;                   // unspecified
  if (h.startsWith('fe80:')) return true;        // link-local
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // unique-local ULA
  return false;
}

/**
 * Returns true if a raw hostname string (before DNS lookup) is obviously private.
 * This is a fast pre-filter; the real check happens after DNS resolution.
 */
function isPrivateHostByName(host: string, allowPrivate = false): boolean {
  if (allowPrivate) return false;
  const h = host.toLowerCase().trim();
  if (h === 'localhost') return true;
  // Numeric IPv4 in decimal notation bypass (e.g. 2130706433 → 127.0.0.1)
  if (/^\d+$/.test(h)) return true;            // pure integer — block immediately
  if (/^0x[0-9a-f]+$/i.test(h)) return true;  // hex notation
  if (net.isIPv4(h)) return isBlockedIPv4(h, false);
  if (net.isIPv6(h)) return isBlockedIPv6(h, false);
  return false;
}

/**
 * Resolve hostname to all IP addresses and validate every one.
 * Throws an error with a reason if any resolved IP is private/blocked.
 *
 * Returns the first safe IPv4 (or IPv6) address to use for the actual
 * TCP connection, preventing DNS rebinding between validation and connect.
 */
export async function resolveAndValidateHost(host: string, allowPrivate = false): Promise<string> {
  // Fast path: if the host is already an IP, validate directly
  if (net.isIPv4(host)) {
    if (isBlockedIPv4(host, allowPrivate)) {
      throw new Error(`Host ${host} resolves to a private/reserved address.`);
    }
    return host;
  }
  if (net.isIPv6(host)) {
    if (isBlockedIPv6(host, allowPrivate)) {
      throw new Error(`Host ${host} resolves to a private/reserved IPv6 address.`);
    }
    return host;
  }

  // DNS resolution
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await dns.promises.lookup(host, { all: true });
  } catch {
    throw new Error(`DNS resolution failed for host: ${host}`);
  }

  if (!addresses || addresses.length === 0) {
    throw new Error(`No IP addresses found for host: ${host}`);
  }

  // Validate every resolved address
  for (const { address, family } of addresses) {
    if (family === 4 && isBlockedIPv4(address, allowPrivate)) {
      throw new Error(
        `Host "${host}" resolves to a private/reserved address (${address}) and is not allowed.`
      );
    }
    if (family === 6 && isBlockedIPv6(address, allowPrivate)) {
      throw new Error(
        `Host "${host}" resolves to a private/reserved IPv6 address (${address}) and is not allowed.`
      );
    }
  }

  // Return first IPv4 (preferred) for stable TCP connect
  const ipv4 = addresses.find(a => a.family === 4);
  return ipv4 ? ipv4.address : addresses[0].address;
}

export function buildConnectionUrl(params: DbConnectionParams): string {
  const { provider, host = 'localhost', port, database = 'eprofile', user = 'root', password = '' } = params;

  if (params.connectionString && params.connectionString.trim() !== '') {
    return params.connectionString.trim();
  }

  if (provider === 'sqlite') {
    return `file:./${database.endsWith('.db') ? database : `${database}.db`}`;
  }

  const encodedUser     = encodeURIComponent(user);
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
 * Test TCP connectivity to a pre-validated (resolved) IP address.
 * Connects to the numeric IP directly to prevent DNS rebinding between
 * validation and connection.
 */
function testTcpConnection(
  resolvedIp: string,
  port: number,
  timeoutMs = 4000
): Promise<{ ok: boolean; latency: number; error?: string }> {
  return new Promise(resolve => {
    const startTime = Date.now();
    const socket     = new net.Socket();
    let resolved     = false;

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
      resolve({ ok: false, latency: 0, error: `Connection timed out after ${timeoutMs}ms` });
    });

    socket.on('error', (err: NodeJS.ErrnoException) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({ ok: false, latency: 0, error: err?.message || `Failed to connect` });
    });

    try {
      socket.connect(port, resolvedIp);
    } catch (e: unknown) {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({
          ok: false,
          latency: 0,
          error: e instanceof Error ? e.message : 'Socket error',
        });
      }
    }
  });
}

/**
 * Validates and tests database connection parameters.
 *
 * Security contract:
 * 1. Pre-validates hostname by name (blocks loopback literals, numeric IP, hex IP).
 * 2. Resolves ALL DNS addresses and validates each — no private IPs allowed.
 * 3. Connects using the resolved numeric IP to prevent DNS rebinding.
 */
export async function testDatabaseConnection(params: DbConnectionParams, allowPrivate = true): Promise<DbTestResult> {
  const startTime     = Date.now();
  const connectionUrl = buildConnectionUrl(params);

  if (params.provider === 'sqlite') {
    try {
      const prismaDir    = path.join(process.cwd(), 'prisma');
      if (!fs.existsSync(prismaDir)) {
        fs.mkdirSync(prismaDir, { recursive: true });
      }
      const testFilePath = path.join(prismaDir, '.write_test.tmp');
      fs.writeFileSync(testFilePath, 'ok');
      fs.unlinkSync(testFilePath);

      return {
        success:    true,
        message:    'เชื่อมต่อ SQLite สำเร็จ! โฟลเดอร์ prisma/ มีสิทธิ์ในการสร้างและเขียนฐานข้อมูล',
        latencyMs:  Date.now() - startTime,
        connectionUrl,
      };
    } catch (err: unknown) {
      return {
        success:  false,
        message:  `ข้อผิดพลาดของสิทธิ์ในไฟล์ SQLite: ${err instanceof Error ? err.message : 'Unknown error'}`,
        connectionUrl,
      };
    }
  }

  // ── PostgreSQL / MySQL ──────────────────────────────────────────────────────
  const rawHost = params.host || 'localhost';
  const defaultPort = params.provider === 'postgresql' ? 5432 : 3306;
  const port        = params.port || defaultPort;

  // Step 1: quick name-based pre-filter
  if (isPrivateHostByName(rawHost, allowPrivate)) {
    return {
      success: false,
      message: `การเชื่อมต่อไปยัง "${rawHost}" ไม่ได้รับอนุญาต (private/local address)`,
      connectionUrl,
    };
  }

  // Step 2: resolve DNS + validate every returned IP
  let resolvedIp: string;
  try {
    resolvedIp = await resolveAndValidateHost(rawHost, allowPrivate);
  } catch (err: unknown) {
    return {
      success: false,
      message: `การตรวจสอบ Host ล้มเหลว: ${err instanceof Error ? err.message : 'Unknown error'}`,
      connectionUrl,
    };
  }

  // Step 3: connect using the validated numeric IP (prevents DNS rebinding)
  const tcpTest = await testTcpConnection(resolvedIp, port);

  if (!tcpTest.ok) {
    let hint = '';
    if (rawHost.includes('host.docker.internal') || rawHost === 'localhost' || rawHost === '127.0.0.1') {
      hint = ' 💡 ข้อแนะนำ: หากรันใน Docker บน Synology NAS หรือ Linux ให้ใช้ IP ของเครื่อง NAS โดยตรง (เช่น 192.168.x.x) หรือชื่อ Database Container (เช่น mariadb / postgres) แทน host.docker.internal';
    } else if (params.provider === 'mysql' && port === 3306) {
      hint = ' 💡 ข้อแนะนำ: หากใช้ MariaDB 10 ของ Synology NAS ให้ลองเปลี่ยนพอร์ตเป็น 3307';
    }

    return {
      success:  false,
      message:  `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ ${params.provider.toUpperCase()} ที่ ${rawHost}:${port} (${tcpTest.error})${hint}`,
      connectionUrl,
    };
  }

  return {
    success:   true,
    message:   `เชื่อมต่อเซิร์ฟเวอร์ ${params.provider.toUpperCase()} (${rawHost}:${port}) สำเร็จ! ความเร็วตอบสนอง ${tcpTest.latency}ms`,
    latencyMs: tcpTest.latency,
    connectionUrl,
  };
}

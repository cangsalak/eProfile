import fs from 'fs';
import path from 'path';
import { API_CATALOGUE_METADATA } from './metadata';

export interface RoleAccessMatrix {
  anonymous: boolean;
  user: boolean;
  officer: boolean;
  editor: boolean;
  admin: boolean;
  superAdmin: boolean;
}

export interface ApiParamDoc {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface ApiEndpointDoc {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  category: string;
  description: string;
  purpose: string;
  authRequired: boolean;
  authGuard: string;
  permission?: string;
  allowedRoles: string[];
  roleMatrix: RoleAccessMatrix;
  pathParams: ApiParamDoc[];
  queryParams: ApiParamDoc[];
  requestBody?: {
    hasBody: boolean;
    description?: string;
    schemaType?: string;
    sample?: Record<string, any>;
  };
  responses: {
    status: number;
    description: string;
    sample?: Record<string, any>;
  }[];
  rateLimit?: string;
  auditLogEnabled: boolean;
  auditAction?: string;
  sensitiveFieldsDetected: string[];
  sourceFile: string;
  handlerLineNumber?: number;
  status: 'COMPLETE' | 'PARTIAL' | 'UNDOCUMENTED';
}

export interface ApiInventorySummary {
  totalApis: number;
  methodCounts: {
    GET: number;
    POST: number;
    PUT: number;
    PATCH: number;
    DELETE: number;
  };
  statusCounts: {
    COMPLETE: number;
    PARTIAL: number;
    UNDOCUMENTED: number;
  };
  categoryCounts: Record<string, number>;
  scannedAt: string;
  durationMs: number;
  apis: ApiEndpointDoc[];
}

const PUBLIC_API_EXACT = [
  '/api/auth/login',
  '/api/auth/setup-admin',
  '/api/install',
  '/api/health',
  '/api/auth/forgot-password',
  '/api/auth/me',
];

const PUBLIC_API_PREFIXES = [
  '/api/verify/',
];

export function scanAllApiRoutes(): ApiInventorySummary {
  const startTime = Date.now();
  const apiRootDir = path.join(process.cwd(), 'src/app/api');
  const routeFiles = findRouteFiles(apiRootDir);

  const apis: ApiEndpointDoc[] = [];

  for (const filePath of routeFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    // Convert path to endpoint e.g. src/app/api/personnel/[id]/route.ts -> /api/personnel/[id]
    const dirOfRoute = path.dirname(filePath);
    const endpointRelative = path.relative(path.join(process.cwd(), 'src/app'), dirOfRoute);
    const endpoint = '/' + endpointRelative.replace(/\\/g, '/');

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Extract HTTP methods exported
      const methods = extractExportedMethods(content);

      for (const method of methods) {
        const handlerLine = findHandlerLineNumber(lines, method);
        const metadata = API_CATALOGUE_METADATA[endpoint]?.[method];

        // 1. Category
        let category = metadata?.category;
        if (!category) {
          category = deriveCategoryFromEndpoint(endpoint);
        }

        // 2. Auth & Roles
        const isPublic = PUBLIC_API_EXACT.includes(endpoint) || PUBLIC_API_PREFIXES.some(p => endpoint.startsWith(p));
        const authAnalysis = analyzeAuthFromCode(content, method, isPublic, endpoint);

        // 3. Path Parameters
        const pathParams = extractPathParams(endpoint, metadata?.pathParamDescriptions);

        // 4. Query Parameters
        const queryParams = extractQueryParams(content, metadata?.queryParamDescriptions);

        // 5. Request Body
        const hasBody = ['POST', 'PUT', 'PATCH'].includes(method);
        const requestBody = hasBody
          ? {
              hasBody: true,
              description: metadata?.requestBodyDescription || 'ข้อมูลที่ส่งในรูปแบบ JSON Body',
              schemaType: extractSchemaName(content) || 'JSON Object',
              sample: metadata?.sampleRequestBody,
            }
          : undefined;

        // 6. Responses & Status codes
        const responses = extractResponses(content, metadata?.sampleResponse);

        // 7. Audit Logging
        const hasAuditLog = content.includes('prisma.auditLog.create') || content.includes('logAuditEvent');
        const auditAction = extractAuditAction(content);

        // 8. Sensitive field check
        const sensitiveFieldsDetected = detectSensitiveFields(content);

        // 9. Documentation Status
        let docStatus: 'COMPLETE' | 'PARTIAL' | 'UNDOCUMENTED' = 'UNDOCUMENTED';
        if (metadata?.description && metadata?.purpose) {
          docStatus = 'COMPLETE';
        } else if (metadata?.description || authAnalysis.authRequired) {
          docStatus = 'PARTIAL';
        }

        apis.push({
          id: `${method}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`,
          endpoint,
          method: method as any,
          category,
          description: metadata?.description || `API สำหรับ ${endpoint} (${method})`,
          purpose: metadata?.purpose || `จัดการข้อมูลผ่าน Endpoint ${endpoint}`,
          authRequired: authAnalysis.authRequired,
          authGuard: authAnalysis.guardDescription,
          permission: authAnalysis.permission,
          allowedRoles: authAnalysis.allowedRoles,
          roleMatrix: authAnalysis.roleMatrix,
          pathParams,
          queryParams,
          requestBody,
          responses,
          rateLimit: metadata?.rateLimit || 'Not configured',
          auditLogEnabled: hasAuditLog,
          auditAction,
          sensitiveFieldsDetected,
          sourceFile: relativePath,
          handlerLineNumber: handlerLine,
          status: docStatus,
        });
      }
    } catch (err) {
      console.warn(`Error scanning route ${filePath}:`, err);
    }
  }

  // Sort APIs by category, endpoint, method
  apis.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.endpoint !== b.endpoint) return a.endpoint.localeCompare(b.endpoint);
    return a.method.localeCompare(b.method);
  });

  const methodCounts = {
    GET: apis.filter(a => a.method === 'GET').length,
    POST: apis.filter(a => a.method === 'POST').length,
    PUT: apis.filter(a => a.method === 'PUT').length,
    PATCH: apis.filter(a => a.method === 'PATCH').length,
    DELETE: apis.filter(a => a.method === 'DELETE').length,
  };

  const statusCounts = {
    COMPLETE: apis.filter(a => a.status === 'COMPLETE').length,
    PARTIAL: apis.filter(a => a.status === 'PARTIAL').length,
    UNDOCUMENTED: apis.filter(a => a.status === 'UNDOCUMENTED').length,
  };

  const categoryCounts: Record<string, number> = {};
  for (const api of apis) {
    categoryCounts[api.category] = (categoryCounts[api.category] || 0) + 1;
  }

  const durationMs = Date.now() - startTime;

  return {
    totalApis: apis.length,
    methodCounts,
    statusCounts,
    categoryCounts,
    scannedAt: new Date().toISOString(),
    durationMs,
    apis,
  };
}

function findRouteFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(findRouteFiles(fullPath));
    } else if (file === 'route.ts' || file === 'route.js') {
      results.push(fullPath);
    }
  }
  return results;
}

function extractExportedMethods(content: string): string[] {
  const methods: string[] = [];
  const regex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    methods.push(match[1]);
  }
  return methods;
}

function findHandlerLineNumber(lines: string[], method: string): number {
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`export\\s+async\\s+function\\s+${method}\\b`).test(lines[i])) {
      return i + 1;
    }
  }
  return 1;
}

function deriveCategoryFromEndpoint(endpoint: string): string {
  const parts = endpoint.split('/').filter(Boolean);
  if (parts.length > 1) {
    const main = parts[1]; // e.g. api/personnel -> personnel
    switch (main) {
      case 'auth': return 'Authentication';
      case 'personnel': return 'Personnel';
      case 'departments': return 'Departments';
      case 'leaves': return 'Leaves';
      case 'vehicles': return 'Vehicles';
      case 'calendar': return 'Calendar';
      case 'roles': return 'Roles';
      case 'settings': return 'Settings';
      case 'backup':
      case 'restore': return 'Backup';
      case 'audit-logs': return 'Audit';
      case 'verify': return 'QR';
      case 'admin': return 'Inspector';
      case 'notifications': return 'Notifications';
      case 'media': return 'Media';
      case 'posts': return 'Posts';
      case 'contacts': return 'Contacts';
      default: return main.charAt(0).toUpperCase() + main.slice(1);
    }
  }
  return 'General';
}

function analyzeAuthFromCode(content: string, method: string, isPublicRoute: boolean, endpoint: string) {
  // Check for SUPER_ADMIN only
  if (endpoint.startsWith('/api/admin/') || content.includes("['SUPER_ADMIN']")) {
    return {
      authRequired: true,
      guardDescription: 'requireRole(req, ["SUPER_ADMIN"])',
      permission: 'SUPER_ADMIN_ONLY',
      allowedRoles: ['SUPER_ADMIN'],
      roleMatrix: {
        anonymous: false,
        user: false,
        officer: false,
        editor: false,
        admin: false,
        superAdmin: true,
      },
    };
  }

  // Check for ADMIN only
  if (endpoint.startsWith('/api/backup') || endpoint.startsWith('/api/restore') || content.includes("requireRole(req, ['ADMIN', 'SUPER_ADMIN'])")) {
    return {
      authRequired: true,
      guardDescription: 'requireRole(req, ["ADMIN", "SUPER_ADMIN"])',
      permission: 'MANAGE_SYSTEM',
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
      roleMatrix: {
        anonymous: false,
        user: false,
        officer: false,
        editor: false,
        admin: true,
        superAdmin: true,
      },
    };
  }

  if (isPublicRoute) {
    return {
      authRequired: false,
      guardDescription: 'Public / Unauthenticated',
      allowedRoles: ['ANONYMOUS', 'USER', 'OFFICER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'],
      roleMatrix: {
        anonymous: true,
        user: true,
        officer: true,
        editor: true,
        admin: true,
        superAdmin: true,
      },
    };
  }

  // Permission matching
  const permMatch = content.match(/requirePermission\(req,\s*['"]([A-Z_]+)['"]\)/);
  const permission = permMatch ? permMatch[1] : undefined;

  let allowedRoles = ['USER', 'OFFICER', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'];
  let roleMatrix: RoleAccessMatrix = {
    anonymous: false,
    user: true,
    officer: true,
    editor: true,
    admin: true,
    superAdmin: true,
  };

  if (permission === 'MANAGE_PERSONNEL' || (method !== 'GET' && endpoint.startsWith('/api/personnel'))) {
    allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
    roleMatrix = { anonymous: false, user: false, officer: false, editor: false, admin: true, superAdmin: true };
  } else if (permission === 'MANAGE_SYSTEM' || endpoint.startsWith('/api/roles')) {
    allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
    roleMatrix = { anonymous: false, user: false, officer: false, editor: false, admin: true, superAdmin: true };
  } else if (endpoint.startsWith('/api/posts') && method !== 'GET') {
    allowedRoles = ['EDITOR', 'ADMIN', 'SUPER_ADMIN'];
    roleMatrix = { anonymous: false, user: false, officer: false, editor: true, admin: true, superAdmin: true };
  }

  return {
    authRequired: true,
    guardDescription: permission ? `requirePermission("${permission}")` : 'requireAuth() / verifyAuth()',
    permission,
    allowedRoles,
    roleMatrix,
  };
}

function extractPathParams(endpoint: string, descriptions?: Record<string, string>): ApiParamDoc[] {
  const matches = endpoint.match(/\[([a-zA-Z0-9_-]+)\]/g);
  if (!matches) return [];

  return matches.map((m) => {
    const paramName = m.replace(/\[|\]/g, '');
    return {
      name: paramName,
      type: 'string',
      required: true,
      description: descriptions?.[paramName] || `พารามิเตอร์ ${paramName} ใน URL path`,
    };
  });
}

function extractQueryParams(content: string, descriptions?: Record<string, string>): ApiParamDoc[] {
  const queryParams: ApiParamDoc[] = [];
  const regex = /searchParams\.get\(['"]([a-zA-Z0-9_-]+)['"]\)/g;
  let match;
  const seen = new Set<string>();

  while ((match = regex.exec(content)) !== null) {
    const param = match[1];
    if (!seen.has(param)) {
      seen.add(param);
      queryParams.push({
        name: param,
        type: ['page', 'limit'].includes(param) ? 'number' : 'string',
        required: false,
        description: descriptions?.[param] || `Query string parameter ?${param}=`,
      });
    }
  }

  return queryParams;
}

function extractSchemaName(content: string): string | undefined {
  const schemaMatch = content.match(/const\s+([a-zA-Z0-9_]+Schema)\s*=\s*z\.object/);
  return schemaMatch ? schemaMatch[1] : undefined;
}

function extractResponses(content: string, sampleResponse?: Record<string, any>) {
  const responses: { status: number; description: string; sample?: Record<string, any> }[] = [];
  
  if (content.includes('status: 201')) {
    responses.push({ status: 201, description: 'สร้างข้อมูลใหม่สำเร็จ (Created)', sample: sampleResponse });
  } else {
    responses.push({ status: 200, description: 'ดำเนินการสำเร็จ (OK)', sample: sampleResponse });
  }

  if (content.includes('status: 400') || content.includes('safeParse')) {
    responses.push({ status: 400, description: 'ข้อมูล Input หรือ Parameter ไม่ถูกต้อง (Bad Request)' });
  }
  if (content.includes('requireAuth') || content.includes('requireRole') || content.includes('requirePermission') || content.includes('status: 401')) {
    responses.push({ status: 401, description: 'ไม่ได้เข้าสู่ระบบ หรือ Token ไม่ถูกต้อง (Unauthorized)' });
  }
  if (content.includes('requireRole') || content.includes('requirePermission') || content.includes('status: 403')) {
    responses.push({ status: 403, description: 'ไม่มีสิทธิ์ในการเข้าถึง API นี้ (Forbidden)' });
  }
  if (content.includes('status: 404')) {
    responses.push({ status: 404, description: 'ไม่พบข้อมูลที่ระบุในฐานข้อมูล (Not Found)' });
  }
  responses.push({ status: 500, description: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์ (Internal Server Error)' });

  return responses;
}

function extractAuditAction(content: string): string | undefined {
  const match = content.match(/action:\s*['"]([A-Z_]+)['"]/);
  return match ? match[1] : undefined;
}

function detectSensitiveFields(content: string): string[] {
  const sensitiveKeywords = ['password', 'passwordHash', 'citizenId', 'token', 'secret', 'credentials'];
  const detected: string[] = [];

  for (const kw of sensitiveKeywords) {
    if (content.toLowerCase().includes(kw.toLowerCase())) {
      detected.push(kw);
    }
  }

  return detected;
}

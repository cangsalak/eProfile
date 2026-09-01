import fs from 'fs';
import path from 'path';

export interface DiscoveredRoute {
  path: string;
  name: string;
  category: 'Core' | 'Personnel' | 'Management' | 'Settings' | 'Auth' | 'Public' | 'Other';
  sourceFile: string;
  isDynamic: boolean;
  dynamicParams?: string[];
}

/**
 * Recursively scans src/app to dynamically discover all page routes
 */
export function scanProjectPageRoutes(baseDir?: string, includeDynamic = false): DiscoveredRoute[] {
  const appDir = baseDir || path.join(process.cwd(), 'src', 'app');
  const discovered: DiscoveredRoute[] = [];

  if (!fs.existsSync(appDir)) {
    return [];
  }

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip API routes directory since they are endpoints, not UI pages
        if (entry.name === 'api') continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        // Check for page.tsx, page.jsx, page.js, page.ts
        if (/^page\.(tsx|jsx|js|ts)$/.test(entry.name)) {
          const relativeToApp = path.relative(appDir, currentDir);
          
          // Clean route path by stripping route groups like (member), (auth), etc.
          const segments = relativeToApp
            .split(path.sep)
            .filter(segment => segment && !segment.startsWith('(') && !segment.endsWith(')'));

          let routePath = '/' + segments.join('/');
          if (routePath === '//' || routePath === '') {
            routePath = '/';
          }

          // Check for dynamic segments like [id]
          const isDynamic = /\[.*?\]/.test(routePath);
          const dynamicParams = isDynamic
            ? (routePath.match(/\[(.*?)\]/g) || []).map(p => p.slice(1, -1))
            : [];

          // Skip dynamic parameterized template routes from static direct crawling
          if (isDynamic && !includeDynamic) {
            continue;
          }

          // Guess friendly name & category
          const { name, category } = deriveRouteMetadata(routePath, fullPath);

          // Avoid duplicates
          if (!discovered.some(d => d.path === routePath)) {
            discovered.push({
              path: routePath,
              name,
              category,
              sourceFile: path.relative(process.cwd(), fullPath),
              isDynamic,
              dynamicParams,
            });
          }
        }
      }
    }
  }

  walk(appDir);

  // Sort logically: Core -> Personnel -> Management -> Settings -> Auth -> Public
  const categoryOrder: Record<string, number> = {
    Core: 1,
    Personnel: 2,
    Management: 3,
    Settings: 4,
    Auth: 5,
    Public: 6,
    Other: 7,
  };

  return discovered.sort((a, b) => {
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.path.localeCompare(b.path);
  });
}

function deriveRouteMetadata(routePath: string, filePath: string): { name: string; category: DiscoveredRoute['category'] } {
  // Read a snippet of file to look for Thai title/heading if available
  let fileTitle = '';
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/<h[12][^>]*>(.*?)<\/h[12]>/);
    if (titleMatch && titleMatch[1]) {
      const clean = titleMatch[1].replace(/<[^>]+>/g, '').trim();
      if (clean && clean.length > 2 && clean.length < 50) {
        fileTitle = clean;
      }
    }
  } catch {}

  if (routePath === '/' || routePath === '/dashboard') {
    return { name: fileTitle || 'หน้าหลัก (Dashboard)', category: 'Core' };
  }
  if (routePath === '/directory') {
    return { name: fileTitle || 'ทำเนียบบุคลากร (Directory)', category: 'Personnel' };
  }
  if (routePath === '/leave') {
    return { name: fileTitle || 'ระบบการลา (Leave)', category: 'Personnel' };
  }
  if (routePath === '/calendar') {
    return { name: fileTitle || 'ปฏิทินปฏิบัติงาน (Calendar)', category: 'Core' };
  }
  if (routePath === '/profile') {
    return { name: fileTitle || 'โปรไฟล์ส่วนตัว (Profile)', category: 'Personnel' };
  }
  if (routePath === '/profile/badges') {
    return { name: fileTitle || 'บัตรประจำตัวดิจิทัล (Badges)', category: 'Personnel' };
  }
  if (routePath === '/settings') {
    return { name: fileTitle || 'ตั้งค่าระบบ (Settings)', category: 'Settings' };
  }
  if (routePath.startsWith('/manage/')) {
    const sub = routePath.replace('/manage/', '');
    const titleMap: Record<string, string> = {
      personnel: 'จัดการข้อมูลบุคลากร (Personnel Management)',
      'personnel/print-badges': 'พิมพ์บัตรประจำตัว (Print Badges)',
      notifications: 'จัดการการแจ้งเตือน (Notifications)',
      posts: 'ข่าวสารประชาสัมพันธ์ (Posts)',
      contacts: 'สมุดโทรศัพท์ (Contacts)',
      media: 'คลังสื่อและเอกสาร (Media)',
      'audit-logs': 'บันทึกกิจกรรมระบบ (Audit Logs)',
      'api-docs': 'API Reference & Documentation',
      inspector: 'System Inspector',
    };
    return { name: fileTitle || titleMap[sub] || `จัดการ ${sub}`, category: 'Management' };
  }
  if (['/login', '/register', '/forgot-password', '/setup', '/install'].includes(routePath)) {
    const authMap: Record<string, string> = {
      '/login': 'เข้าสู่ระบบ (Login)',
      '/register': 'ลงทะเบียน (Register)',
      '/forgot-password': 'ลืมรหัสผ่าน (Forgot Password)',
      '/setup': 'ตั้งค่าเริ่มต้น (Setup)',
      '/install': 'ติดตั้งระบบ (Install)',
    };
    return { name: fileTitle || authMap[routePath] || routePath, category: 'Auth' };
  }

  return { name: fileTitle || routePath, category: 'Public' };
}

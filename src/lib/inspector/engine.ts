import { THAI_DICTIONARY, PLACEHOLDER_PATTERNS } from './dictionary';

export interface FindingItem {
  findingCode: string;
  category: 'Typography' | 'UI' | 'Links' | 'Images' | 'Form' | 'Buttons' | 'Accessibility' | 'Responsive' | 'Console' | 'SecurityHeaders' | 'Performance' | 'Route';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  page?: string;
  url?: string;
  expected?: string;
  actual?: string;
  element?: string;
  selector?: string;
  recommendation: string;
}

export interface RouteInspectionSummary {
  path: string;
  name: string;
  category: string;
  status: 'PASS' | 'NEEDS_REVIEW' | 'CRITICAL_ISSUES' | 'ERROR';
  httpStatus: number;
  durationMs: number;
  findingsCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface InspectionReport {
  page: string;
  url: string;
  scanMode: 'QUICK' | 'STANDARD' | 'FULL' | 'PROJECT';
  durationMs: number;
  overallResult: 'PASS' | 'NEEDS_REVIEW' | 'CRITICAL_ISSUES';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  totalFindings: number;
  findings: FindingItem[];
  // Project-wide extra metadata
  isProjectWide?: boolean;
  totalPagesScanned?: number;
  routeSummaries?: RouteInspectionSummary[];
}

export interface ProjectRouteItem {
  path: string;
  name: string;
  category: 'Core' | 'Personnel' | 'Management' | 'Settings' | 'Auth' | 'Public' | 'Other';
}

/**
 * Dynamically fetch discovered page routes from the server scanner API
 */
export async function fetchDynamicProjectRoutes(): Promise<ProjectRouteItem[]> {
  try {
    const res = await fetch('/api/admin/inspector/routes', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.routes) && data.routes.length > 0) {
        return data.routes.map((r: any) => ({
          path: r.path,
          name: r.name,
          category: r.category,
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic routes, using fallback:', err);
  }
  return [
    { path: '/dashboard', name: 'หน้าหลัก (Dashboard)', category: 'Core' },
    { path: '/modules/personnel/directory', name: 'ทำเนียบบุคลากร (Directory)', category: 'Personnel' },
    { path: '/modules/personnel/manage', name: 'จัดการบุคลากร (Personnel Management)', category: 'Personnel' },
    { path: '/modules/leaves', name: 'ระบบการลา (Leave Management)', category: 'Personnel' },
    { path: '/modules/vehicles', name: 'ระบบยานพาหนะ (Vehicle Management)', category: 'Management' },
    { path: '/modules/badges', name: 'พิมพ์บัตรประจำตัว (Badge Studio)', category: 'Management' },
    { path: '/modules/calendar', name: 'ปฏิทินปฏิบัติงาน (Duty Calendar)', category: 'Core' },
    { path: '/modules/news', name: 'ระบบข่าวสารและประกาศ (News & Announcements)', category: 'Management' },
    { path: '/modules/contacts', name: 'ระบบข้อมูลติดต่อ (Contacts)', category: 'Management' },
    { path: '/modules/command-dashboard', name: 'แดชบอร์ดผู้บังคับบัญชา (Command Dashboard)', category: 'Core' },
    { path: '/modules/system-inspector', name: 'ตรวจสอบความปลอดภัยระบบ (System Inspector)', category: 'Management' },
    { path: '/modules/module-manager', name: 'จัดการโมดูลส่วนเสริม (Module Manager)', category: 'Settings' },
    { path: '/modules/theme', name: 'ตั้งค่าธีมและระบบทั่วไป (Theme & Branding)', category: 'Settings' },
    { path: '/modules/backup', name: 'สำรองและกู้คืนข้อมูล (Backup & Restore)', category: 'Settings' },
  ];
}

/**
 * Inspect a given DOM Document
 */
export function inspectDomDocument(
  doc: Document,
  pageTitle: string,
  pageUrl: string,
  mode: 'QUICK' | 'STANDARD' | 'FULL' | 'PROJECT' = 'STANDARD',
  codeOffset = 1
): { findings: FindingItem[]; nextOffset: number } {
  const findings: FindingItem[] = [];
  let counter = codeOffset;

  const nextCode = (prefix: string) => {
    const num = String(counter++).padStart(3, '0');
    return `${prefix}-${num}`;
  };

  // 1. Text & Typo Check
  try {
    const textNodes: string[] = [];
    const walker = doc.createTreeWalker(
      doc.body || doc.documentElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'code', 'pre'].includes(tag)) return NodeFilter.FILTER_REJECT;
          if (parent.closest('.no-inspect')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      const text = currentNode.nodeValue?.trim();
      if (text && text.length > 1) {
        textNodes.push(text);

        // Thai Dictionary Check
        for (const entry of THAI_DICTIONARY) {
          if (text.includes(entry.wrong)) {
            const isFalsePositive = entry.correct.startsWith(entry.wrong) && text.includes(entry.correct);
            if (!isFalsePositive) {
              findings.push({
                findingCode: nextCode('TX'),
                category: 'Typography',
                severity: entry.severity,
                title: `พบคำสะกดผิด: "${entry.wrong}"`,
                description: `พบคำว่า "${entry.wrong}" ในข้อความ "${text.substring(0, 60)}"`,
                page: pageTitle,
                url: pageUrl,
                expected: `"${entry.correct}"`,
                actual: `"${entry.wrong}"`,
                element: currentNode.parentElement?.tagName.toLowerCase(),
                recommendation: entry.recommendation,
              });
            }
          }
        }

        // Placeholder Pattern Check
        for (const pattern of PLACEHOLDER_PATTERNS) {
          if (pattern.regex.test(text)) {
            findings.push({
              findingCode: nextCode('TX'),
              category: 'Typography',
              severity: pattern.severity,
              title: `พบข้อความชั่วคราว/Placeholder: ${pattern.name}`,
              description: `พบข้อความที่ตรงกับแพทเทิร์น "${pattern.name}" ในข้อความ: "${text.substring(0, 60)}"`,
              page: pageTitle,
              url: pageUrl,
              expected: 'ข้อความจริงที่ผ่านการตรวจสอบแล้ว',
              actual: text.substring(0, 60),
              element: currentNode.parentElement?.tagName.toLowerCase(),
              recommendation: 'แทนที่ข้อความ placeholder ด้วยข้อความจริงของระบบก่อนขึ้น Production',
            });
          }
        }
      }
      currentNode = walker.nextNode();
    }
  } catch (err) {
    console.warn('Text check error:', err);
  }

  // 2. Link Checker
  try {
    const anchors = Array.from(doc.querySelectorAll('a:not(.no-inspect *)'));
    for (const a of anchors) {
      const href = a.getAttribute('href');
      const text = a.textContent?.trim() || '';

      if (!href) {
        findings.push({
          findingCode: nextCode('LK'),
          category: 'Links',
          severity: 'HIGH',
          title: 'ลิงก์ไม่มี attribute href',
          description: `พบแท็ก <a> ที่ไม่มี attribute href (ข้อความ: "${text || 'ไม่มีข้อความ'}")`,
          page: pageTitle,
          url: pageUrl,
          expected: 'href="/target-route"',
          actual: 'href is missing',
          element: 'a',
          recommendation: 'เพิ่ม href หรือเปลี่ยนเป็น <button> หากเป็นการกระทำเชิงโต้ตอบ',
        });
      } else if (href === '#' && !a.getAttribute('role')) {
        findings.push({
          findingCode: nextCode('LK'),
          category: 'Links',
          severity: 'LOW',
          title: 'ลิงก์ใช้ href="#" โดยไม่มี role',
          description: `พบแท็ก <a> ที่มี href="#" (ข้อความ: "${text || 'ไม่มีข้อความ'}")`,
          page: pageTitle,
          url: pageUrl,
          expected: 'ระบุ URL ปลายทางที่ถูกต้อง หรือใช้ปุ่ม button สำหรับ JavaScript actions',
          actual: 'href="#"',
          element: 'a',
          recommendation: 'เปลี่ยน href="#" เป็น <button type="button">',
        });
      }
    }
  } catch (err) {
    console.warn('Link check error:', err);
  }

  // 3. Image Checker
  try {
    const images = Array.from(doc.querySelectorAll('img:not(.no-inspect *)')) as HTMLImageElement[];
    for (const img of images) {
      const alt = img.getAttribute('alt');
      const src = img.getAttribute('src');

      if (!src) {
        findings.push({
          findingCode: nextCode('IMG'),
          category: 'Images',
          severity: 'HIGH',
          title: 'รูปภาพไม่มี attribute src',
          description: 'พบแท็ก <img> ที่ไม่มีค่า src หรือ src ว่างเปล่า',
          page: pageTitle,
          url: pageUrl,
          expected: 'src="/path/to/image.png"',
          actual: 'src is empty',
          element: 'img',
          recommendation: 'ระบุ URL รูปภาพที่ถูกต้องหรือลบแท็ก <img> ที่ไม่ใช้งาน',
        });
      }

      if (alt === null || alt === undefined) {
        findings.push({
          findingCode: nextCode('AX'),
          category: 'Accessibility',
          severity: 'LOW',
          title: 'รูปภาพไม่มี attribute alt สำหรับ Accessibility',
          description: `รูปภาพ (${src?.substring(0, 40) || 'no src'}) ขาด attribute alt`,
          page: pageTitle,
          url: pageUrl,
          expected: 'alt="คำอธิบายรูปภาพ"',
          actual: 'alt attribute missing',
          element: 'img',
          recommendation: 'เพิ่ม attribute alt เพื่อรองรับ Screen Reader และมาตรฐาน WCAG 2.2',
        });
      }
    }
  } catch (err) {
    console.warn('Image check error:', err);
  }

  // 4. Button Checker
  try {
    const buttons = Array.from(doc.querySelectorAll('button:not(.no-inspect *)')) as HTMLButtonElement[];
    for (const btn of buttons) {
      const text = btn.textContent?.trim() || '';
      const ariaLabel = btn.getAttribute('aria-label') || btn.getAttribute('title') || '';
      
      if (!text && !ariaLabel && !btn.querySelector('svg, i')) {
        findings.push({
          findingCode: nextCode('BTN'),
          category: 'Buttons',
          severity: 'HIGH',
          title: 'ปุ่มไม่มีข้อความหรือ Accessible Name',
          description: 'พบปุ่ม <button> ว่างเปล่า ไม่มีทั้งข้อความ, aria-label หรือไอคอน',
          page: pageTitle,
          url: pageUrl,
          expected: '<button>บันทึก</button> หรือ aria-label="บันทึก"',
          actual: 'Empty button',
          element: 'button',
          recommendation: 'เพิ่มข้อความบนปุ่ม หรือกำหนด aria-label ให้ชัดเจน',
        });
      }
    }
  } catch (err) {
    console.warn('Button check error:', err);
  }

  // 5. Deep Form, Input, Button & CSS Design System Inspection
  try {
    const forms = Array.from(doc.querySelectorAll('form:not(.no-inspect *)'));
    for (const form of forms) {
      const classStr = form.getAttribute('class') || '';
      const hasDarkMode = classStr.includes('dark:');
      if (classStr.includes('bg-white') && !hasDarkMode) {
        findings.push({
          findingCode: nextCode('CSS'),
          category: 'Form',
          severity: 'LOW',
          title: 'ฟอร์ม <form> ขาดคลาส Dark Mode Pair (dark:bg-slate-900)',
          description: 'พบฟอร์มที่มีคลาส bg-white แต่ไม่มีคลาส dark:bg-* กำกับคู่กัน อาจทำให้การแสดงผลในโหมดมืด (Dark Mode) ไม่สมบูรณ์',
          page: pageTitle,
          url: pageUrl,
          expected: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800',
          actual: classStr || 'ไม่มีคลาส Dark Mode',
          element: 'form',
          recommendation: 'ระบุคู่คลาส Light Mode และ Dark Mode ร่วมกันเสมอตามกฎ AGENTS.md',
        });
      }
    }

    const inputs = Array.from(
      doc.querySelectorAll(
        'input:not([type="hidden"]):not(.no-inspect *), select:not(.no-inspect *), textarea:not(.no-inspect *), button:not(.no-inspect *)'
      )
    );

    for (const input of inputs) {
      const tag = input.tagName.toLowerCase();
      const inputType = (input.getAttribute('type') || '').toLowerCase();
      const classStr = input.getAttribute('class') || '';
      const id = input.getAttribute('id');
      const name = input.getAttribute('name');
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');

      // 5.1 Button Type & Brand Color Inspection
      if (tag === 'button') {
        const typeAttr = input.getAttribute('type');
        if (!typeAttr) {
          findings.push({
            findingCode: nextCode('BTN'),
            category: 'Buttons',
            severity: 'LOW',
            title: 'ปุ่ม <button> ขาดการระบุ attribute type',
            description: 'พบปุ่ม <button> ที่ไม่ได้ระบุ type="button" หรือ type="submit" (ค่าเริ่มต้นของเบราว์เซอร์จะถือเป็น submit ซึ่งอาจทำให้ฟอร์มส่งข้อมูลโดยไม่ตั้งใจ)',
            page: pageTitle,
            url: pageUrl,
            expected: 'type="button" หรือ type="submit"',
            actual: 'type attribute missing',
            element: 'button',
            recommendation: 'ระบุ type="button" หรือ type="submit" ให้ชัดเจนบนทุกแท็ก <button>',
          });
        }

        // Hardcoded Non-Theme Color Check (e.g. indigo-*, purple-*)
        if (classStr.match(/\b(bg|text|border|ring)-(indigo|purple|violet)-\d+/)) {
          const matched = classStr.match(/\b(bg|text|border|ring)-(indigo|purple|violet)-\d+/)?.[0];
          findings.push({
            findingCode: nextCode('CSS'),
            category: 'UI',
            severity: 'LOW',
            title: 'ปุ่มใช้คลาสสีแบรนด์แบบคงที่ (Fixed Branding Color)',
            description: `พบการใช้คลาสสีคงที่ "${matched}" บนปุ่ม ซึ่งขัดต่อกฎการรักษาระบบธีมของแอปพลิเคชัน`,
            page: pageTitle,
            url: pageUrl,
            expected: 'ใช้คลาสธีม primary-* (เช่น bg-primary-600 hover:bg-primary-700)',
            actual: matched || classStr,
            element: 'button',
            recommendation: 'เปลี่ยนคลาสสีแบรนด์คงที่ indigo-*/purple-* เป็น primary-* เพื่อให้รองรับการเปลี่ยนธีมย่อยของระบบ',
          });
        }
        continue;
      }

      // 5.2 Label Association & ARIA Check
      const hasLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
      const parentLabel = input.closest('label');

      if (!hasLabel && !parentLabel && !ariaLabel && !ariaLabelledBy) {
        findings.push({
          findingCode: nextCode('FM'),
          category: 'Form',
          severity: 'LOW',
          title: `ช่องกรอกข้อมูล <${tag}> ไม่มี Label กำกับ`,
          description: `ช่องกรอกข้อมูลประเภท ${inputType || tag} ไม่มี <label for="..."> หรือ aria-label`,
          page: pageTitle,
          url: pageUrl,
          expected: `<label for="${id || 'inputId'}">ชื่อฟิลด์</label>`,
          actual: 'No associated label',
          element: tag,
          recommendation: 'เพิ่มแท็ก <label for="..."> หรือ aria-label เพื่อรองรับ Accessibility (WCAG 2.2)',
        });
      }

      // 5.3 Form Input Name / ID Identifier Check
      if (!id && !name && !['submit', 'button', 'reset', 'checkbox', 'radio'].includes(inputType)) {
        findings.push({
          findingCode: nextCode('FM'),
          category: 'Form',
          severity: 'INFO',
          title: `ช่องกรอกข้อมูล <${tag}> ขาด attribute name หรือ id`,
          description: `ช่องกรอกข้อมูลไม่มีทั้ง name และ id ซึ่งอาจทำให้การจัดการฟอร์มและบันทึกข้อมูลยุ่งยาก`,
          page: pageTitle,
          url: pageUrl,
          expected: 'name="fieldName" หรือ id="fieldId"',
          actual: 'name & id are missing',
          element: tag,
          recommendation: 'กำหนด attribute name หรือ id ให้ชัดเจนสำหรับทุกฟิลด์ในฟอร์ม',
        });
      }

      // 5.4 Form Input Style & Theme Consistency Check
      const isCustomWidget = ['hidden', 'checkbox', 'radio', 'file', 'color', 'range', 'submit', 'button', 'reset'].includes(inputType);
      const isSrOnly = classStr.includes('sr-only') || classStr.includes('hidden');

      if (!isCustomWidget && !isSrOnly) {
        const hasBorder = classStr.includes('border');
        const hasRounded = classStr.includes('rounded');
        const hasDarkMode = classStr.includes('dark:');

        if (!hasBorder || !hasRounded) {
          findings.push({
            findingCode: nextCode('FM'),
            category: 'Form',
            severity: 'LOW',
            title: `รูปแบบสไตล์ UI ของ <${tag}> ขาดความสอดคล้องตาม Design System`,
            description: `Element <${tag}> มีคลาสสไตล์ที่ขาด border หรือ rounded ตามมาตรฐานฟอร์มของระบบ`,
            page: pageTitle,
            url: pageUrl,
            expected: 'ใช้คลาส form-input/form-select/form-textarea หรือ (rounded-xl border-slate-200 focus:ring-primary-500)',
            actual: classStr ? `class="${classStr}"` : 'ไม่มีคลาสสไตล์ (Unstyled)',
            element: tag,
            recommendation: 'ใช้คลาสฟอร์มมาตรฐาน เช่น .form-input, .form-select, .form-textarea หรือคลาส rounded-xl border เพื่อความสอดคล้องทั้งระบบ',
          });
        } else if (!hasDarkMode) {
          findings.push({
            findingCode: nextCode('CSS'),
            category: 'Form',
            severity: 'LOW',
            title: `ช่องกรอกข้อมูล <${tag}> ขาดคลาส Dark Mode (dark:bg-* / dark:border-*)`,
            description: `Element <${tag}> มีคลาสสไตล์สำหรับ Light Mode แต่ไม่มีคลาส dark:bg-* หรือ dark:border-* สำหรับ Dark Mode`,
            page: pageTitle,
            url: pageUrl,
            expected: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white',
            actual: classStr,
            element: tag,
            recommendation: 'เพิ่มคลาส Dark Mode เช่น dark:bg-slate-800 dark:border-slate-700 dark:text-white',
          });
        }
      }

      // 5.5 Select Dropdown Options Check
      if (tag === 'select') {
        const options = input.querySelectorAll('option');
        if (options.length === 0) {
          findings.push({
            findingCode: nextCode('FM'),
            category: 'Form',
            severity: 'HIGH',
            title: 'ตัวเลือก <select> ว่างเปล่า (ไม่มีตัวเลือก <option>)',
            description: 'พบ Dropdown <select> ที่ไม่มีตัวเลือก <option> ภายใน',
            page: pageTitle,
            url: pageUrl,
            expected: '<select><option value="">กรุณาเลือก...</option></select>',
            actual: '0 options inside select',
            element: 'select',
            recommendation: 'เพิ่มรายการ <option> หรือตรวจสอบการโหลดข้อมูลไดนามิกใน dropdown',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Form check error:', err);
  }

  // 6. Heading Hierarchy (Accessibility)
  try {
    const h1Count = doc.querySelectorAll('h1:not(.no-inspect *)').length;
    if (h1Count === 0) {
      findings.push({
        findingCode: nextCode('AX'),
        category: 'Accessibility',
        severity: 'LOW',
        title: 'หน้านี้ไม่มีหัวข้อหลัก <h1>',
        description: 'โครงสร้างหน้าเว็บควรมีหัวข้อหลัก <h1> อย่างน้อย 1 รายการเพื่อระบุหัวข้อของหน้า',
        page: pageTitle,
        url: pageUrl,
        expected: '1 หัวข้อ <h1>',
        actual: '0 หัวข้อ <h1>',
        element: 'h1',
        recommendation: 'เพิ่มแท็ก <h1> ระบุชื่อของหน้าเพื่อโครงสร้าง SEO และ Accessibility ที่ดี',
      });
    } else if (h1Count > 2) {
      findings.push({
        findingCode: nextCode('AX'),
        category: 'Accessibility',
        severity: 'INFO',
        title: 'พบหัวข้อ <h1> มากกว่า 1 รายการในหน้าเดียว',
        description: `พบหัวข้อ <h1> ทั้งหมด ${h1Count} จุด ควรจำกัดให้มี 1 หัวข้อหลักต่อหน้า`,
        page: pageTitle,
        url: pageUrl,
        expected: '1 หัวข้อ <h1>',
        actual: `${h1Count} หัวข้อ <h1>`,
        element: 'h1',
        recommendation: 'ปรับเปลี่ยนหัวข้อย่อยให้เป็น <h2> หรือ <h3> ตามลำดับชั้น',
      });
    }
  } catch (err) {
    console.warn('Heading hierarchy check error:', err);
  }

  // 7. Duplicate Element ID Check
  try {
    const allWithId = Array.from(doc.querySelectorAll('[id]:not(.no-inspect *)'));
    const idMap = new Map<string, number>();
    for (const el of allWithId) {
      const id = el.id.trim();
      if (id) {
        idMap.set(id, (idMap.get(id) || 0) + 1);
      }
    }
    for (const [id, count] of idMap.entries()) {
      if (count > 1) {
        findings.push({
          findingCode: nextCode('UI'),
          category: 'UI',
          severity: 'HIGH',
          title: `พบ ID ซ้ำกันในหน้า: "${id}"`,
          description: `พบ Element ที่ใช้ ID "${id}" ซ้ำกันจำนวน ${count} จุดใน DOM เดียวกัน`,
          page: pageTitle,
          url: pageUrl,
          expected: 'ID ต้องไม่ซ้ำกันในหน้าเว็บ (Unique ID)',
          actual: `พบซ้ำ ${count} จุด`,
          element: 'DOM ID',
          recommendation: 'แก้ไข ID ให้ไม่ซ้ำกัน หรือเปลี่ยนไปใช้ class name แทน',
        });
      }
    }
  } catch (err) {
    console.warn('Duplicate ID check error:', err);
  }

  // 8. Performance DOM Check
  const domCount = doc.querySelectorAll('*').length;
  if (domCount > 1500) {
    findings.push({
      findingCode: nextCode('PRF'),
      category: 'Performance',
      severity: 'MEDIUM',
      title: 'ขนาด DOM Tree ใหญ่เกินมาตรฐาน (> 1,500 Nodes)',
      description: `พบ Element ในหน้านี้ทั้งหมด ${domCount} Nodes ซึ่งอาจทำให้ Render ช้าลงบนอุปกรณ์มือถือ`,
      page: pageTitle,
      url: pageUrl,
      expected: 'DOM Nodes < 1,500 Nodes',
      actual: `${domCount} Nodes`,
      element: 'DOM Tree',
      recommendation: 'พิจารณาใช้ Virtualization หรือ Pagination เพื่อลดจำนวน Element ในหน้า',
    });
  }

  // 9. Table & Pagination Checker
  try {
    const docBodyText = doc.body?.textContent || '';
    const tables = Array.from(doc.querySelectorAll('table:not(.no-inspect *)'));
    for (const table of tables) {
      const rows = table.querySelectorAll('tbody tr');
      const hasPagination = doc.querySelector('.pagination, [aria-label*="pagination"], [aria-label*="การแบ่งหน้า"], [aria-label*="หน้า"]') ||
        docBodyText.includes('แสดง 1 ถึง') ||
        docBodyText.includes('แถวต่อหน้า') ||
        docBodyText.includes('จากทั้งหมด');

      if (rows.length > 10 && !hasPagination) {
        findings.push({
          findingCode: nextCode('TBL'),
          category: 'UI',
          severity: 'MEDIUM',
          title: 'ตารางข้อมูลไม่มีระบบแบ่งหน้า (Table Pagination)',
          description: `พบตารางแสดงผล ${rows.length} แถว แต่ไม่พบแถบควบคุมการแบ่งหน้า (Pagination)`,
          page: pageTitle,
          url: pageUrl,
          expected: 'ตารางควรมี TablePagination เพื่อจำกัดจำนวนแถวและปรับปรุงประสิทธิภาพ',
          actual: `ตารางแสดงผล ${rows.length} แถวโดยไม่มีการแบ่งหน้า`,
          element: 'table',
          recommendation: 'เพิ่ม TablePagination Component เพื่อรองรับการจัดการข้อมูลขนาดใหญ่',
        });
      }
    }
  } catch (err) {
    console.warn('Table check error:', err);
  }

  // 10. Management Route & Access Control Checker
  try {
    if (pageUrl.startsWith('/manage')) {
      const hasManagementBanner = doc.querySelector('h1, h2, .badge, [class*="badge"]');
      if (!hasManagementBanner) {
        findings.push({
          findingCode: nextCode('SEC'),
          category: 'UI',
          severity: 'LOW',
          title: 'หน้าจัดการขาดการระบุบทบาทหรือสิทธิ์การเข้าถึง',
          description: 'หน้าในกลุ่ม /manage ควรมี Header และการระบุสิทธิ์ที่ชัดเจนตามมาตรฐานของระบบ',
          page: pageTitle,
          url: pageUrl,
          expected: 'Header Banner พร้อมการตรวจสอบสิทธิ์ของผู้ใช้',
          actual: 'ไม่มี Header มาตรฐาน',
          element: 'Management Container',
          recommendation: 'ใช้ Dashboard Header Banner และตรวจสอบสิทธิ์ผ่าน useAuth / /api/auth/me',
        });
      }
    }
  } catch (err) {
    console.warn('Management check error:', err);
  }

  return { findings, nextOffset: counter };
}

/**
 * Scan Single Current Page in Browser
 */
export async function runClientPageInspection(mode: 'QUICK' | 'STANDARD' | 'FULL' = 'STANDARD'): Promise<InspectionReport> {
  const startTime = performance.now();
  const currentUrl = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
  const pageTitle = typeof document !== 'undefined' ? document.title || 'eProfile' : 'eProfile';

  if (typeof document === 'undefined') {
    return {
      page: 'ServerSide',
      url: currentUrl,
      scanMode: mode,
      durationMs: 0,
      overallResult: 'PASS',
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      infoCount: 0,
      totalFindings: 0,
      findings: [],
    };
  }

  const { findings, nextOffset } = inspectDomDocument(document, pageTitle, currentUrl, mode, 1);
  let counter = nextOffset;

  // Responsive Check for Current Active Viewport
  try {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    if (scrollWidth > clientWidth + 5) {
      findings.push({
        findingCode: `RSP-${String(counter++).padStart(3, '0')}`,
        category: 'Responsive',
        severity: 'HIGH',
        title: 'พบปัญหา Layout ล้นจอแนวนอน (Horizontal Scroll Overflow)',
        description: `ความกว้างของเนื้อหา (${scrollWidth}px) กว้างกว่าหน้าจอ (${clientWidth}px) ทำให้เกิด Scrollbar แนวนอน`,
        page: pageTitle,
        url: currentUrl,
        expected: 'scrollWidth <= clientWidth',
        actual: `scrollWidth (${scrollWidth}px) > clientWidth (${clientWidth}px)`,
        element: 'html/body',
        recommendation: 'ตรวจสอบ Element ที่มี fixed width หรือ overflow-x และปรับใช้ max-w-full หรือ overflow-hidden',
      });
    }
  } catch (err) {
    console.warn('Responsive check error:', err);
  }

  // Security Headers Check
  if (mode === 'STANDARD' || mode === 'FULL') {
    try {
      const res = await fetch('/api/admin/inspector/check-headers');
      if (res.ok) {
        const headerReport = await res.json();
        if (headerReport.missingHeaders && Array.isArray(headerReport.missingHeaders)) {
          for (const h of headerReport.missingHeaders) {
            findings.push({
              findingCode: `SEC-${String(counter++).padStart(3, '0')}`,
              category: 'SecurityHeaders',
              severity: h.severity || 'MEDIUM',
              title: `ขาด Security Response Header: ${h.name}`,
              description: `เซิร์ฟเวอร์ไม่ได้ส่ง Security Header "${h.name}" ใน Response`,
              page: pageTitle,
              url: currentUrl,
              expected: h.recommendation,
              actual: 'Header is missing',
              element: 'HTTP Response Headers',
              recommendation: `กำหนดค่า ${h.name} ใน next.config.js หรือ Reverse Proxy เพื่อยกระดับความปลอดภัย`,
            });
          }
        }
      }
    } catch {
      // Best effort header check
    }
  }

  const durationMs = Math.round(performance.now() - startTime);
  const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = findings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter(f => f.severity === 'LOW').length;
  const infoCount = findings.filter(f => f.severity === 'INFO').length;

  let overallResult: 'PASS' | 'NEEDS_REVIEW' | 'CRITICAL_ISSUES' = 'PASS';
  if (criticalCount > 0 || highCount > 2) {
    overallResult = 'CRITICAL_ISSUES';
  } else if (highCount > 0 || mediumCount > 0 || lowCount > 3) {
    overallResult = 'NEEDS_REVIEW';
  }

  return {
    page: pageTitle,
    url: currentUrl,
    scanMode: mode,
    durationMs,
    overallResult,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    totalFindings: findings.length,
    findings,
  };
}

/**
 * Scan ALL Routes in the Entire Project
 */
export async function runFullProjectInspection(
  onProgress?: (current: number, total: number, route: ProjectRouteItem) => void
): Promise<InspectionReport> {
  const startTime = performance.now();
  const allFindings: FindingItem[] = [];
  const routeSummaries: RouteInspectionSummary[] = [];
  let globalOffset = 1;

  // 1. Dynamically discover all routes from project files
  const routes = await fetchDynamicProjectRoutes();
  const total = routes.length;

  for (let i = 0; i < total; i++) {
    const route = routes[i];
    if (onProgress) {
      onProgress(i + 1, total, route);
    }

    const routeStart = performance.now();
    let httpStatus = 200;
    let pageFindings: FindingItem[] = [];

    try {
      const res = await fetch(route.path, { credentials: 'include' });
      httpStatus = res.status;

      if (!res.ok) {
        pageFindings.push({
          findingCode: `RT-${String(globalOffset++).padStart(3, '0')}`,
          category: 'Route',
          severity: httpStatus === 404 ? 'HIGH' : 'CRITICAL',
          title: `หน้าเว็บตอบสนองด้วย HTTP Error ${httpStatus}`,
          description: `เส้นทาง ${route.path} ตอบกลับด้วย HTTP Status ${httpStatus}`,
          page: route.name,
          url: route.path,
          expected: 'HTTP 200 OK',
          actual: `HTTP ${httpStatus}`,
          element: 'Route Endpoint',
          recommendation: 'ตรวจสอบไฟล์เพจใน App Router ว่ามีข้อผิดพลาด Server-Side หรือเส้นทางไม่ถูกต้อง',
        });
      } else {
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const result = inspectDomDocument(doc, route.name, route.path, 'PROJECT', globalOffset);
        pageFindings = result.findings;
        globalOffset = result.nextOffset;
      }
    } catch (err: any) {
      httpStatus = 0;
      pageFindings.push({
        findingCode: `RT-${String(globalOffset++).padStart(3, '0')}`,
        category: 'Route',
        severity: 'CRITICAL',
        title: `ไม่สามารถเชื่อมต่อเส้นทาง: ${route.path}`,
        description: `เกิดข้อผิดพลาดในการ Fetch ข้อมูล: ${err.message || 'Network Error'}`,
        page: route.name,
        url: route.path,
        expected: 'เชื่อมต่อสำเร็จ',
        actual: err.message || 'Connection failed',
        element: 'Route Network',
        recommendation: 'ตรวจสอบการทำงานของเว็บเซิร์ฟเวอร์ และ Middleware',
      });
    }

    const routeDuration = Math.round(performance.now() - routeStart);
    const criticals = pageFindings.filter(f => f.severity === 'CRITICAL').length;
    const highs = pageFindings.filter(f => f.severity === 'HIGH').length;
    const mediums = pageFindings.filter(f => f.severity === 'MEDIUM').length;
    const lows = pageFindings.filter(f => f.severity === 'LOW').length;

    let routeStatus: 'PASS' | 'NEEDS_REVIEW' | 'CRITICAL_ISSUES' | 'ERROR' = 'PASS';
    if (httpStatus >= 400 || httpStatus === 0) {
      routeStatus = 'ERROR';
    } else if (criticals > 0 || highs > 1) {
      routeStatus = 'CRITICAL_ISSUES';
    } else if (highs > 0 || mediums > 0 || lows > 2) {
      routeStatus = 'NEEDS_REVIEW';
    }

    routeSummaries.push({
      path: route.path,
      name: route.name,
      category: route.category,
      status: routeStatus,
      httpStatus,
      durationMs: routeDuration,
      findingsCount: pageFindings.length,
      criticalCount: criticals,
      highCount: highs,
      mediumCount: mediums,
      lowCount: lows,
    });

    allFindings.push(...pageFindings);

    // Yield control briefly to avoid blocking main thread UI
    await new Promise(r => setTimeout(r, 40));
  }

  // Check Security Headers globally for the project
  try {
    const res = await fetch('/api/admin/inspector/check-headers');
    if (res.ok) {
      const headerReport = await res.json();
      if (headerReport.missingHeaders && Array.isArray(headerReport.missingHeaders)) {
        for (const h of headerReport.missingHeaders) {
          allFindings.push({
            findingCode: `SEC-${String(globalOffset++).padStart(3, '0')}`,
            category: 'SecurityHeaders',
            severity: h.severity || 'MEDIUM',
            title: `ขาด Security Response Header: ${h.name}`,
            description: `เซิร์ฟเวอร์ไม่ได้ส่ง Security Header "${h.name}" ใน Response`,
            page: 'Global Security',
            url: 'All Routes',
            expected: h.recommendation,
            actual: 'Header is missing',
            element: 'HTTP Response Headers',
            recommendation: `กำหนดค่า ${h.name} ใน next.config.js หรือ Reverse Proxy เพื่อยกระดับความปลอดภัย`,
          });
        }
      }
    }
  } catch {
    // Best effort
  }

  const durationMs = Math.round(performance.now() - startTime);
  const criticalCount = allFindings.filter(f => f.severity === 'CRITICAL').length;
  const highCount = allFindings.filter(f => f.severity === 'HIGH').length;
  const mediumCount = allFindings.filter(f => f.severity === 'MEDIUM').length;
  const lowCount = allFindings.filter(f => f.severity === 'LOW').length;
  const infoCount = allFindings.filter(f => f.severity === 'INFO').length;

  let overallResult: 'PASS' | 'NEEDS_REVIEW' | 'CRITICAL_ISSUES' = 'PASS';
  if (criticalCount > 0 || highCount > 2) {
    overallResult = 'CRITICAL_ISSUES';
  } else if (highCount > 0 || mediumCount > 0 || lowCount > 3) {
    overallResult = 'NEEDS_REVIEW';
  }

  return {
    page: `ทั้งโปรเจค eProfile (${total} เส้นทาง)`,
    url: '/ (Project-wide)',
    scanMode: 'PROJECT',
    durationMs,
    overallResult,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    totalFindings: allFindings.length,
    findings: allFindings,
    isProjectWide: true,
    totalPagesScanned: total,
    routeSummaries,
  };
}

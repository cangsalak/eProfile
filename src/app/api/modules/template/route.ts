import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { requireRole } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { error, user } = await requireRole(request, ['SUPER_ADMIN', 'ADMIN']);
    if (error || !user) {
      return error || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const zip = new JSZip();

    // 1. manifest.json
    const sampleManifest = {
      id: 'equipment-loan',
      name: 'ระบบยืม-คืนอุปกรณ์',
      nameEn: 'Equipment Loan System',
      description: 'ระบบบันทึกการยืมและคืนยุทโธปกรณ์ อุปกรณ์ภาคสนาม และพัสดุสำนักงาน',
      version: '1.0.0',
      author: 'E-Profile Community',
      icon: 'fa-toolbox',
      category: 'operations',
      isCore: false,
      defaultEnabled: true,
      menus: [
        {
          id: 'equipment-loan-menu',
          title: 'ยืม-คืนอุปกรณ์',
          icon: 'fa-solid fa-toolbox',
          path: '/modules/equipment-loan',
          requiredPermission: 'MANAGE_EQUIPMENT',
          order: 48,
        },
      ],
      permissions: [
        {
          key: 'MANAGE_EQUIPMENT',
          name: 'จัดการยืม-คืนอุปกรณ์',
          description: 'สิทธิ์ในการบันทึกและอนุมัติรายการยืม-คืนอุปกรณ์',
        },
      ],
    };
    zip.file('manifest.json', JSON.stringify(sampleManifest, null, 2));

    // 2. index.ts
    const indexContent = `export * from './manifest';
export { default as EquipmentLoanView } from './views/EquipmentLoanView';
`;
    zip.file('index.ts', indexContent);

    // 3. views/EquipmentLoanView.tsx
    const viewContent = `'use client';

import React, { useState } from 'react';

export default function EquipmentLoanView() {
  const [items] = useState([
    { id: '1', code: 'EQ-001', name: 'วิทยุสื่อสารมือถือ (Walkie Talkie)', total: 10, borrowed: 3 },
    { id: '2', code: 'EQ-002', name: 'กล้องส่องทางไกล (Binoculars)', total: 5, borrowed: 1 },
    { id: '3', code: 'EQ-003', name: 'เต็นท์ภาคสนาม 4 คน', total: 8, borrowed: 4 },
  ]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-toolbox"></i>
            </span>
            ระบบยืม-คืนอุปกรณ์ (Equipment Loan)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            ตัวอย่างโมดูลส่วนเสริม (Add-on Module) ที่ติดตั้งผ่านระบบ Module ZIP Uploader
          </p>
        </div>
        <button
          onClick={() => alert('ฟังก์ชันตัวอย่างสำหรับโมดูลใหม่')}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all shadow-md shadow-primary-500/25 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          <span>บันทึกการยืมใหม่</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          รายการอุปกรณ์ในคลัง
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-bold text-slate-500">
              <tr>
                <th className="p-3.5 rounded-l-xl">รหัส</th>
                <th className="p-3.5">ชื่ออุปกรณ์</th>
                <th className="p-3.5 text-center">คงเหลือในคลัง</th>
                <th className="p-3.5 text-center rounded-r-xl">ถูกยืมไป</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-semibold text-primary-600 dark:text-primary-400">{it.code}</td>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">{it.name}</td>
                  <td className="p-3.5 text-center">{it.total - it.borrowed} / {it.total}</td>
                  <td className="p-3.5 text-center text-amber-600 dark:text-amber-400 font-semibold">{it.borrowed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
    zip.file('views/EquipmentLoanView.tsx', viewContent);

    // 4. README.md
    const readmeContent = `# Equipment Loan Module Template
This is a sample module template for eProfile System.

## Structure
- \`manifest.json\`: Required module metadata, menus, and permissions.
- \`index.ts\`: Entry export file.
- \`views/EquipmentLoanView.tsx\`: The main UI view component.

## Packaging
To install into eProfile:
1. Edit \`manifest.json\` with your own module ID, name, menus, and permissions.
2. Build your views and components inside this folder.
3. Zip all files (ensure \`manifest.json\` is at the root of the zip file).
4. Upload via E-Profile Admin: Settings > Modules > Upload Module (.ZIP).
`;
    zip.file('README.md', readmeContent);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="sample-module-template.zip"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Failed to generate sample module zip', err);
    return NextResponse.json({ error: 'ไม่สามารถสร้างไฟล์เทมเพลตได้' }, { status: 500 });
  }
}

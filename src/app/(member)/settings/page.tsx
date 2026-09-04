import Link from 'next/link';
import { redirect } from 'next/navigation';

const legacyTabRoutes: Record<string, string> = {
  system: '/modules/theme',
  badge: '/modules/badges/settings',
  roles: '/modules/personnel/roles',
  dropdowns: '/modules/system-inspector/categories',
  departments: '/modules/personnel/departments',
  notifications: '/modules/news/settings',
  line: '/modules/news/settings',
  mail: '/modules/news/settings',
  modules: '/modules/system-inspector/modules',
  menus: '/modules/menus',
  maintenance: '/modules/backup',
};

const settingsModules = [
  { href: '/modules/theme', icon: 'fa-palette', title: 'ระบบทั่วไปและธีม', description: 'ชื่อระบบ โลโก้ สี และรูปแบบการแสดงผล' },
  { href: '/modules/badges/settings', icon: 'fa-id-card', title: 'ออกแบบบัตร', description: 'รูปแบบและข้อมูลบนบัตรประจำตัว' },
  { href: '/modules/personnel/roles', icon: 'fa-user-shield', title: 'สิทธิ์การใช้งาน', description: 'บทบาทและสิทธิ์การเข้าถึงระบบ' },
  { href: '/modules/personnel/departments', icon: 'fa-building', title: 'หน่วยงาน', description: 'โครงสร้างหน่วยงานและหน่วยย่อย' },
  { href: '/modules/system-inspector/categories', icon: 'fa-tags', title: 'ข้อมูลพื้นฐาน', description: 'รายการตัวเลือกที่ใช้ในระบบ' },
  { href: '/modules/news/settings', icon: 'fa-bell', title: 'การแจ้งเตือน', description: 'การแจ้งเตือน LINE และ Email' },
  { href: '/modules/system-inspector/modules', icon: 'fa-puzzle-piece', title: 'จัดการโมดูล', description: 'เปิด ปิด ติดตั้ง และถอนการติดตั้งโมดูล' },
  { href: '/modules/menus', icon: 'fa-compass', title: 'จัดการเมนู', description: 'ตรวจสอบโครงสร้างและเส้นทางเมนู' },
  { href: '/modules/backup', icon: 'fa-database', title: 'สำรองและกู้คืนข้อมูล', description: 'จัดการ backup และ restore ระบบ' },
];

export default function SettingsPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const legacyRoute = searchParams.tab ? legacyTabRoutes[searchParams.tab] : undefined;
  if (legacyRoute) redirect(legacyRoute);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">System Administration</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">ตั้งค่าระบบ</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">เลือกจัดการแต่ละส่วนผ่าน module เจ้าของโดยตรง</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {settingsModules.map((item) => (
          <Link key={item.href} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-primary-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400">
                <i className={`fa-solid ${item.icon}`} />
              </span>
              <span>
                <span className="block font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

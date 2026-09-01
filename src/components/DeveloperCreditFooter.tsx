/**
 * ============================================================
 * ⚠️  DEVELOPER CREDIT FOOTER — DO NOT REMOVE OR MODIFY ⚠️
 * ============================================================
 * ส่วนนี้เป็นข้อมูลผู้พัฒนาระบบที่จำเป็นต้องแสดงเสมอ
 * การลบหรือแก้ไขจะทำให้การตรวจสอบความสมบูรณ์ล้มเหลว
 * ============================================================
 */
import { DEVELOPER_CREDIT } from '@/lib/developer-credit';

export default function DeveloperCreditFooter() {
  return (
    <footer
      id="dev-credit-footer"
      data-integrity="required"
      className="w-full border-t border-slate-200/60 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm print:hidden"
      style={{ fontFamily: 'inherit' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        {/* Left: System name */}
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400">eProfile System</span>
          <span>•</span>
          <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
        </div>

        {/* Right: Developer credit */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-code text-[10px] text-indigo-400" />
            <span>พัฒนาโดย</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">{DEVELOPER_CREDIT.name}</span>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-phone text-[10px] text-green-400" />
            <a
              href={`tel:${DEVELOPER_CREDIT.phone}`}
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {DEVELOPER_CREDIT.phone}
            </a>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-envelope text-[10px] text-sky-400" />
            <a
              href={`mailto:${DEVELOPER_CREDIT.email}`}
              className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {DEVELOPER_CREDIT.email}
            </a>
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-mug-hot text-[10px] text-amber-400" />
            <span>ค่ากาแฟ:</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">{DEVELOPER_CREDIT.bankRef}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

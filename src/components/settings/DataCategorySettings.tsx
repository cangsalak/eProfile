import React, { useState } from 'react';

interface DataCategorySettingsProps {
  settings: any;
  setSettings: any;
}

const DEFAULTS = {
  personnelTypes: ['นายทหารสัญญาบัตร', 'นายทหารประทวน', 'พนักงานราชการ', 'ลูกจ้าง', 'ทหารกองประจำการ'],
  statusList: ['ปฏิบัติงานปกติ', 'ไปช่วยราชการ', 'ไปช่วยราชการภายนอกหน่วย', 'มาช่วยราชการ', 'ลาพักผ่อน', 'ลาป่วย/ลากิจ', 'ศึกษา/ดูงาน', 'ย้ายหน่วย/พ้นสภาพ'],
  prefixes: ['นาย', 'นาง', 'นางสาว', 'ร.ต.', 'ร.ท.', 'ร.อ.', 'พ.ต.', 'พ.ท.', 'พ.อ.', 'พล.ต.', 'พล.ท.', 'พล.อ.', 'ส.ต.', 'ส.ท.', 'ส.อ.', 'จ.ส.ต.', 'จ.ส.ท.', 'จ.ส.อ.'],
  leaveTypes: ['ลาพักผ่อน', 'ลากิจ', 'ลาป่วย', 'ลาคลอดบุตร', 'ลาอุปสมบท', 'ไปช่วยราชการ'],
  vehicleTypes: ['รถยนต์ส่วนบุคคล', 'รถจักรยานยนต์', 'รถยนต์ราชการ', 'รถจักรยานยนต์ราชการ'],
  educationLevels: ['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย / ปวช.', 'อนุปริญญา / ปวส.', 'ปริญญาตรี', 'ปริญญาโท', 'ปริญญาเอก'],
  bloodGroups: ['A', 'B', 'AB', 'O'],
};

export default function DataCategorySettings({ settings, setSettings }: DataCategorySettingsProps) {
  // State to track open/closed categories (Default: first 2 open, or all openable)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    personnelTypes: true,
    statusList: true,
    prefixes: false,
    leaveTypes: false,
    vehicleTypes: false,
    educationLevels: false,
    bloodGroups: false,
  });

  const toggleCategory = (key: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    categories.forEach(c => { allOpen[c.key] = true; });
    setOpenCategories(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    categories.forEach(c => { allClosed[c.key] = false; });
    setOpenCategories(allClosed);
  };

  const getArrayItems = (key: keyof typeof DEFAULTS): string[] => {
    try {
      if (settings[key]) {
        const parsed = JSON.parse(settings[key]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return DEFAULTS[key];
  };

  const getArrayValue = (key: keyof typeof DEFAULTS): string => {
    return getArrayItems(key).join(', ');
  };

  const handleListChange = (key: keyof typeof DEFAULTS, value: string) => {
    const arr = value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    setSettings({ ...settings, [key]: JSON.stringify(arr) });
  };

  const categories: Array<{
    key: keyof typeof DEFAULTS;
    title: string;
    description: string;
    icon: string;
    badgeColor: string;
  }> = [
    {
      key: 'personnelTypes',
      title: '1. ประเภทกำลังพล (Personnel Types)',
      description: 'กำหนดกลุ่มหรือประเภทของบุคลากร เช่น นายทหารสัญญาบัตร, นายทหารประทวน, พนักงานราชการ, ลูกจ้าง ฯลฯ',
      icon: 'fa-id-card-clip',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      key: 'statusList',
      title: '2. สถานะการปฏิบัติงาน (Status)',
      description: 'กำหนดสถานะการทำงานปัจจุบัน เช่น ปฏิบัติงานปกติ, ไปช่วยราชการ, ลาพักผ่อน, ย้ายหน่วย/พ้นสภาพ ฯลฯ',
      icon: 'fa-user-check',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      key: 'prefixes',
      title: '3. คำนำหน้าชื่อ / ยศ (Prefixes / Ranks)',
      description: 'กำหนดคำนำหน้าชื่อหรือยศทางทหาร/พลเรือน เช่น นาย, นาง, ร.ต., ร.ท., ร.อ., พ.ต., พ.ท., พ.อ. ฯลฯ',
      icon: 'fa-signature',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      key: 'leaveTypes',
      title: '4. ประเภทการลา (Leave Types)',
      description: 'กำหนดประเภทการลาสำหรับฟอร์มยื่นใบลา เช่น ลาพักผ่อน, ลากิจ, ลาป่วย, ลาคลอดบุตร, ลาอุปสมบท ฯลฯ',
      icon: 'fa-calendar-minus',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      key: 'vehicleTypes',
      title: '5. ประเภทพาหนะ (Vehicle Types)',
      description: 'กำหนดประเภทรถและยานพาหนะ เช่น รถยนต์ส่วนบุคคล, รถจักรยานยนต์, รถยนต์ราชการ ฯลฯ',
      icon: 'fa-car-side',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
      key: 'educationLevels',
      title: '6. ระดับการศึกษา (Education Levels)',
      description: 'กำหนดระดับการศึกษาของกำลังพล เช่น มัธยมศึกษาตอนปลาย, ปริญญาตรี, ปริญญาโท, ปริญญาเอก ฯลฯ',
      icon: 'fa-graduation-cap',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
    {
      key: 'bloodGroups',
      title: '7. หมู่โลหิต (Blood Groups)',
      description: 'กำหนดกลุ่มเลือด เช่น A, B, AB, O',
      icon: 'fa-droplet',
      badgeColor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header with quick actions */}
      <div className="border-b border-slate-200 dark:border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <i className="fa-solid fa-list-check text-primary-500 mr-2.5 text-2xl"></i> จัดการรายการตัวเลือก (Dropdowns)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กำหนดตัวเลือกสำหรับใช้ในฟอร์มบันทึกข้อมูลบุคลากร คำขอลา ยานพาหนะ และข้อมูลทั่วไป (คั่นแต่ละรายการด้วยเครื่องหมายคอมมา <code>,</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-angles-down text-[10px]"></i> ขยายทั้งหมด
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-angles-up text-[10px]"></i> ย่อทั้งหมด
          </button>
        </div>
      </div>

      {/* Full Width Collapsible Accordion List */}
      <div className="space-y-4 w-full">
        {categories.map((cat) => {
          const isOpen = !!openCategories[cat.key];
          const items = getArrayItems(cat.key);

          return (
            <div
              key={cat.key}
              className={`w-full rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                isOpen
                  ? 'bg-white dark:bg-slate-900/80 border-primary-500/40 shadow-md ring-1 ring-primary-500/10'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Accordion Header / Click to Toggle */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none select-none transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 border ${cat.badgeColor}`}>
                    <i className={`fa-solid ${cat.icon}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {cat.title}
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                        {items.length} รายการ
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium ${isOpen ? 'text-primary-500' : 'text-slate-400'}`}>
                    {isOpen ? 'ย่อ' : 'ขยาย'}
                  </span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-primary-500/10 text-primary-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
              </button>

              {/* Accordion Content Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 animate-fade-in">
                  {/* Tag Chips Preview */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      ตัวอย่างรายการปัจจุบัน:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                      {items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-1.5"></span>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Edit Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        แก้ไขรายการตัวเลือก (คั่นด้วยเครื่องหมายคอมมา <code>,</code>):
                      </label>
                      <button
                        type="button"
                        onClick={() => handleListChange(cat.key, DEFAULTS[cat.key].join(', '))}
                        className="text-[11px] text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-rotate-left text-[10px]"></i> คืนค่าเริ่มต้น
                      </button>
                    </div>
                    <textarea
                      value={getArrayValue(cat.key)}
                      onChange={(e) => handleListChange(cat.key, e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-y font-sans leading-relaxed shadow-inner"
                      placeholder="เช่น รายการที่ 1, รายการที่ 2, รายการที่ 3"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

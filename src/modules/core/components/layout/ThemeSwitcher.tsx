import React from 'react';

interface ThemeSwitcherProps {
  setTheme: (themeName: string) => void;
}

export default function ThemeSwitcher({ setTheme }: ThemeSwitcherProps) {
  return (
    <div className="relative group">
      <button 
        aria-label="เปลี่ยนธีมระบบ NextAdmin"
        className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
      >
        <i className="fa-solid fa-palette text-sm text-[#5750F1]"></i>
      </button>
      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        <div className="p-2.5 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span>ธีมระบบ NextAdmin</span>
          <span className="px-1.5 py-0.5 rounded bg-[#5750F1] text-white text-[9px]">v2</span>
        </div>
        <button onClick={() => setTheme('nextadmin')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-[#5750F1]/10 hover:text-[#5750F1] flex items-center transition-colors">
          <div className="w-4 h-4 rounded-full bg-[#5750F1] mr-3 shadow-sm"></div> NextAdmin Standard Blue
        </button>
        <button onClick={() => setTheme('custom')} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 hover:text-purple-400 flex items-center transition-colors border-t border-slate-100 dark:border-slate-800">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mr-3 shadow-sm"></div> สีแต่งเอง (Custom Accent)
        </button>
      </div>
    </div>
  );
}

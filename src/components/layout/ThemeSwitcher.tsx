import React from 'react';

interface ThemeSwitcherProps {
  setTheme: (themeName: string) => void;
}

export default function ThemeSwitcher({ setTheme }: ThemeSwitcherProps) {
  return (
    <div className="relative group">
      <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
        <i className="fa-solid fa-palette"></i>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-slate-50 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
        <div className="p-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/50">เลือกธีมระบบ</div>
        <button onClick={() => setTheme('indigo')} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center transition-colors">
          <div className="w-4 h-4 rounded-full bg-indigo-500 mr-3"></div> คลาสสิค (Indigo)
        </button>
        <button onClick={() => setTheme('emerald')} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 flex items-center transition-colors">
          <div className="w-4 h-4 rounded-full bg-emerald-500 mr-3"></div> ธรรมชาติ (Emerald)
        </button>
        <button onClick={() => setTheme('ocean')} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-sky-500/20 hover:text-sky-400 flex items-center transition-colors">
          <div className="w-4 h-4 rounded-full bg-sky-500 mr-3"></div> มหาสมุทร (Ocean)
        </button>
        <button onClick={() => setTheme('rose')} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 flex items-center transition-colors border-t border-slate-200 dark:border-slate-700/50">
          <div className="w-4 h-4 rounded-full bg-rose-500 mr-3"></div> ดอกกุหลาบ (Rose)
        </button>
      </div>
    </div>
  );
}

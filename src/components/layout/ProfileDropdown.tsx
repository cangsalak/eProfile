import React, { useState } from 'react';
import Link from 'next/link';
import { Personnel } from '@/types/personnel';

interface ProfileDropdownProps {
  currentUser: Personnel;
  handleLogout: () => void;
}

export default function ProfileDropdown({ currentUser, handleLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none p-1.5 rounded-full hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700"
      >
        <div className="text-right hidden sm:block leading-tight">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.firstName} {currentUser.lastName}</div>
          <div className="text-xs text-primary-400 font-medium">{currentUser.position || currentUser.role}</div>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-lg">
          {currentUser.avatarColor?.startsWith('data:image') || currentUser.avatarColor?.startsWith('http') ? (
            <img src={currentUser.avatarColor} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.firstName?.[0] || 'U'}</span>
          )}
        </div>
        <i className="fa-solid fa-chevron-down text-xs text-slate-500 dark:text-slate-400"></i>
      </button>

      {/* Dropdown Menu (iOS glassmorphism style) */}
      <div className={`absolute right-0 mt-3 w-64 bg-slate-50 dark:bg-slate-800/70 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300 origin-top-right z-50 p-1.5 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
        <div className="p-3 border-b border-slate-200 dark:border-white/10 mb-1 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-600 shrink-0">
            {currentUser.avatarColor?.startsWith('data:image') || currentUser.avatarColor?.startsWith('http') ? (
              <img src={currentUser.avatarColor} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-500 flex items-center justify-center font-bold text-white text-lg">
                {currentUser.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{currentUser.prefix}{currentUser.firstName} {currentUser.lastName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email || currentUser.badgeNo}</div>
          </div>
        </div>
        
        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition-all group/item">
          <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center mr-3 group-hover/item:bg-primary-500 group-hover/item:text-white transition-all">
            <i className="fa-solid fa-id-card"></i>
          </div>
          โปรไฟล์ของฉัน
        </Link>
        
        <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full flex items-center px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all group/item mt-1 border-t border-white/5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mr-3 group-hover/item:bg-rose-500 group-hover/item:text-white transition-all">
            <i className="fa-solid fa-power-off"></i>
          </div>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

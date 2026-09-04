'use client';

import React from 'react';
import { Personnel } from '@/types/personnel';

interface ProfileModalProps {
  person: Personnel | null;
  onClose: () => void;
  onPrintCard: (person: Personnel) => void;
}

export default function ProfileModal({ person, onClose, onPrintCard }: ProfileModalProps) {
  if (!person) return null;

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden relative"
        data-theme={person.profileTheme || 'indigo'}
      >
        {/* Cover Photo */}
        <div className="w-full h-32 md:h-48 bg-white dark:bg-slate-900 relative">
          {person.coverPhoto ? (
            <img src={person.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-900/50 to-primary-600/30"></div>
          )}
        </div>

        <div className="p-6 md:p-8 -mt-16 md:-mt-24 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-end gap-4">
              {person.avatarColor?.startsWith('data:image') || person.avatarColor?.startsWith('http') ? (
                <img src={person.avatarColor} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
              ) : (
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white font-bold text-4xl shadow-xl border-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  style={{ backgroundColor: person.avatarColor || '#3b82f6' }}
                >
                  {person.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="pb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white drop-shadow-md">
                  {person.prefix} {person.firstName} {person.lastName}
                </h3>
                <p className="text-sm text-primary-400 font-medium drop-shadow-md">{person.position}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 drop-shadow-md">
                  {person.department} • {person.subDepartment}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 text-slate-900 dark:text-white hover:bg-black/80 flex items-center justify-center shadow-lg transition-colors absolute top-4 right-4 z-20"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="space-y-6 text-sm">
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">เลขประจำตัวบุคลากร</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">{person.badgeNo}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">สถานะการทำงาน</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-medium">{person.status}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">เบอร์โทรภายใน</span>
              {person.phone ? (
                <a
                  href={`tel:${person.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium inline-flex items-center gap-1.5"
                  title="คลิกเพื่อโทรออก"
                >
                  <i className="fa-solid fa-phone text-xs"></i>
                  <span>{person.phone}</span>
                </a>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">เบอร์มือถือ</span>
              {person.mobile ? (
                <a
                  href={`tel:${person.mobile.replace(/[^0-9+]/g, '')}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium inline-flex items-center gap-1.5"
                  title="คลิกเพื่อโทรออก"
                >
                  <i className="fa-solid fa-mobile-screen text-xs"></i>
                  <span>{person.mobile}</span>
                </a>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </div>
            {person.email && (
              <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-2 mt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">อีเมลติดต่อ</span>
                <a
                  href={`mailto:${person.email}`}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium inline-flex items-center gap-1.5"
                  title="คลิกเพื่อส่งอีเมล"
                >
                  <i className="fa-solid fa-envelope text-xs"></i>
                  <span>{person.email}</span>
                </a>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-graduation-cap me-2 text-primary-400"></i>วุฒิการศึกษา
            </h4>
            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              {person.education}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-screwdriver-wrench me-2 text-amber-400"></i>ความเชี่ยวชาญพิเศษ
            </h4>
            <div className="flex flex-wrap gap-2">
              {person.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <i className="fa-solid fa-briefcase me-2 text-emerald-400"></i>ประวัติการทำงาน
            </h4>
            <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-line text-xs leading-relaxed">
              {person.experience}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:bg-slate-700"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={() => onPrintCard(person)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-500 flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i> พิมพ์บัตรประจำตัว
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

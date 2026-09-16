'use client';

import React from 'react';
import { Personnel } from '@/modules/users';
import { Modal, Button } from '@/components/ui';

interface ProfileModalProps {
  person: Personnel | null;
  onClose: () => void;
  onPrintCard: (person: Personnel) => void;
}

export default function ProfileModal({ person, onClose, onPrintCard }: ProfileModalProps) {
  if (!person) return null;

  return (
    <Modal
      isOpen={!!person}
      onClose={onClose}
      size="lg"
      className="p-0 overflow-hidden"
      footer={
        <div className="flex justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            ปิดหน้าต่าง
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onPrintCard(person)}
            className="flex items-center gap-2"
          >
            <i className="fa-solid fa-print"></i> พิมพ์บัตรประจำตัว
          </Button>
        </div>
      }
    >
      <div 
        className="w-full relative"
        data-theme={person.profileTheme || 'indigo'}
      >
        {/* Cover Photo */}
        <div className="w-full h-32 md:h-44 bg-slate-100 dark:bg-slate-900 relative -m-6 mb-0 w-[calc(100%+3rem)] overflow-hidden">
          {person.coverPhoto ? (
            <img src={person.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-900/50 to-primary-600/30"></div>
          )}
        </div>

        <div className="pt-4 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-end gap-4 -mt-14 sm:-mt-16">
              {person.avatarColor?.startsWith('data:image') || person.avatarColor?.startsWith('http') ? (
                <img src={person.avatarColor} alt="Avatar" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900 shrink-0" />
              ) : (
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-xl border-4 border-white dark:border-slate-900 bg-primary-600 shrink-0"
                  style={{ backgroundColor: person.avatarColor || undefined }}
                >
                  {person.firstName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="pb-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                  {person.prefix} {person.firstName} {person.lastName}
                </h3>
                <p className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-medium">{person.position}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {person.department} {person.subDepartment ? `• ${person.subDepartment}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">เลขประจำตัวบุคลากร</span>
                <span className="font-mono text-slate-900 dark:text-white font-semibold">{person.badgeNo}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">สถานะการทำงาน</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{person.status}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">เบอร์โทรภายใน</span>
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
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">เบอร์มือถือ</span>
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
                <div className="col-span-2 border-t border-slate-200/80 dark:border-slate-700/60 pt-2.5 mt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">อีเมลติดต่อ</span>
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

            {person.education && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <i className="fa-solid fa-graduation-cap me-2 text-primary-500"></i>วุฒิการศึกษา
                </h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
                  {person.education}
                </p>
              </div>
            )}

            {person.skills && person.skills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <i className="fa-solid fa-screwdriver-wrench me-2 text-amber-500"></i>ความเชี่ยวชาญพิเศษ
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {person.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-300 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.experience && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  <i className="fa-solid fa-briefcase me-2 text-emerald-500"></i>ประวัติการทำงาน
                </h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 whitespace-pre-line text-xs leading-relaxed">
                  {person.experience}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

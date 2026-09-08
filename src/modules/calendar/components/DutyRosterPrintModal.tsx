'use client';

import React, { useRef } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarEventItem } from '../types';
import { X, Printer, FileText } from 'lucide-react';

interface DutyRosterPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  events: CalendarEventItem[];
}

export const DutyRosterPrintModal: React.FC<DutyRosterPrintModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  events,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Filter duty/operation and meeting events in this active month
  const monthEvents = events
    .filter((ev) => {
      const s = new Date(ev.startDate);
      const e = new Date(ev.endDate);
      return (
        isWithinInterval(s, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(e, { start: monthStart, end: monthEnd }) ||
        (s <= monthStart && e >= monthEnd)
      );
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - Non printable in window.print via print:hidden */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                พิมพ์บัญชีรายชื่อตารางเวรปฏิบัติการ (A4 Landscape)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ประจำเดือน {format(currentDate, 'MMMM yyyy', { locale: th })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / บันทึกเป็น PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-950 flex justify-center">
          <div
            ref={printAreaRef}
            className="w-full max-w-3xl bg-white text-black p-8 rounded-xl shadow-lg border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0"
            style={{ minHeight: '600px' }}
          >
            {/* ── Official Header ── */}
            <div className="text-center space-y-1 mb-6 border-b pb-4 border-black/30">
              <h1 className="text-lg font-bold tracking-tight">
                บัญชีรายชื่อผู้ปฏิบัติหน้าที่เวรยามและภารกิจประจำวัน
              </h1>
              <h2 className="text-sm font-semibold">
                ประจำเดือน {format(currentDate, 'MMMM พ.ศ. yyyy', { locale: th })}
              </h2>
            </div>

            {/* ── Official Table ── */}
            <table className="w-full text-left text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100/90 print:bg-slate-100 font-bold text-center border-b border-black">
                  <th className="border border-black p-2 w-10 text-center">ลำดับ</th>
                  <th className="border border-black p-2 w-28 text-center">วัน / เดือน / ปี</th>
                  <th className="border border-black p-2 w-16 text-center">วัน</th>
                  <th className="border border-black p-2">ภารกิจ / เวรปฏิบัติการ</th>
                  <th className="border border-black p-2 w-40">ผู้ปฏิบัติหน้าที่</th>
                  <th className="border border-black p-2 w-24 text-center">เวลา</th>
                  <th className="border border-black p-2 w-28">สถานที่</th>
                </tr>
              </thead>
              <tbody>
                {monthEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-black p-6 text-center text-slate-500">
                      ไม่มีรายการเวรปฏิบัติการในเดือนนี้
                    </td>
                  </tr>
                ) : (
                  monthEvents.map((ev, index) => {
                    const s = new Date(ev.startDate);
                    const e = new Date(ev.endDate);
                    const isAllDay = ev.allDay || ev.type === 'leave';

                    return (
                      <tr key={ev.id} className="border-b border-black/80">
                        <td className="border border-black p-2 text-center font-mono">{index + 1}</td>
                        <td className="border border-black p-2 text-center">
                          {format(s, 'd MMMM yyyy', { locale: th })}
                        </td>
                        <td className="border border-black p-2 text-center font-medium">
                          {format(s, 'EEE', { locale: th })}
                        </td>
                        <td className="border border-black p-2 font-semibold">
                          {ev.title}
                          {ev.description && (
                            <div className="text-[11px] font-normal text-slate-600 mt-0.5">
                              {ev.description}
                            </div>
                          )}
                        </td>
                        <td className="border border-black p-2 font-medium">
                          {ev.assigneeName || (ev.type === 'leave' ? 'กำลังพลลา' : '-')}
                        </td>
                        <td className="border border-black p-2 text-center font-mono text-[11px]">
                          {isAllDay ? 'ตลอดวัน' : `${format(s, 'HH:mm')} - ${format(e, 'HH:mm')}`}
                        </td>
                        <td className="border border-black p-2 text-[11px]">{ev.location || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* ── Official Signature Blocks ── */}
            <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-12">
                <p className="font-semibold">ตรวจถูกต้อง</p>
                <div>
                  <p>(........................................................)</p>
                  <p className="mt-1 text-slate-700">นายทหารควบคุมเวรยาม</p>
                  <p className="text-[11px] text-slate-500">วันที่ ......./......./.......</p>
                </div>
              </div>

              <div className="space-y-12">
                <p className="font-semibold">ทราบ / อนุมัติ</p>
                <div>
                  <p>(........................................................)</p>
                  <p className="mt-1 text-slate-700">ผู้บังคับบัญชา</p>
                  <p className="text-[11px] text-slate-500">วันที่ ......./......./.......</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

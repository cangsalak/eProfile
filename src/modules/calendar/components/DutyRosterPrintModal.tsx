'use client';

import React, { useRef } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarEventItem } from '../types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="พิมพ์บัญชีรายชื่อตารางเวรปฏิบัติการ (A4 Landscape)"
      subtitle={`ประจำเดือน ${format(currentDate, 'MMMM yyyy', { locale: th })}`}
      icon="fa-solid fa-print"
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon="fa-solid fa-print"
          >
            สั่งพิมพ์ / บันทึกเป็น PDF
          </Button>
        </div>
      }
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm 12mm 10mm 12mm;
            }
          }
        `
      }} />
      <div className="flex justify-center bg-slate-100/70 dark:bg-slate-950 p-2 sm:p-4 rounded-xl font-prompt overflow-x-auto print:bg-transparent print:p-0 print:m-0 print:border-none print:w-full">
        <div
          ref={printAreaRef}
          className="w-full max-w-3xl bg-white text-black p-8 rounded-xl shadow-md border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:min-h-0"
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
    </Modal>
  );
};

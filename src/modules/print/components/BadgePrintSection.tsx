'use client';

import React, { useState } from 'react';
import { BadgePrintMode, PaperSettings } from '../types';
import IDBadge from '@/modules/badges/components/IDBadge';
import CR80Pair from '@/modules/badges/components/CR80Pair';
import { Badge, Button } from '@/components/ui';

interface BadgePrintSectionProps {
  person: any;
  allPersonnel?: any[];
  settings?: any;
  paperSettings: PaperSettings;
}

export default function BadgePrintSection({
  person,
  allPersonnel = [],
  settings = {},
  paperSettings,
}: BadgePrintSectionProps) {
  const [printMode, setPrintMode] = useState<BadgePrintMode>('pair');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(allPersonnel.slice(0, 4).map((p) => String(p.id)));

  const activePersonnelList = isBulkMode
    ? allPersonnel.filter((p) => selectedIds.includes(String(p.id)))
    : [person];

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setPrintMode('pair')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              printMode === 'pair'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <i className="fa-solid fa-table-columns text-xs" />
            <span>หน้า-หลังคู่กัน (0.05 มม.)</span>
          </button>
          <button
            type="button"
            onClick={() => setPrintMode('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              printMode === 'front'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>เฉพาะด้านหน้า</span>
          </button>
          <button
            type="button"
            onClick={() => setPrintMode('back')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              printMode === 'back'
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>เฉพาะด้านหลัง</span>
          </button>
        </div>

        {/* Single / Bulk toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={isBulkMode ? 'primary' : 'outline'}
            size="xs"
            icon="fa-solid fa-users"
            onClick={() => setIsBulkMode(!isBulkMode)}
          >
            {isBulkMode ? `พิมพ์กลุ่ม (${selectedIds.length} คน)` : 'พิมพ์รายบุคคล'}
          </Button>
          <Badge variant="success" size="xs">
            CR80 Standard (5.4 x 8.6 cm)
          </Badge>
        </div>
      </div>

      {/* Bulk Selection checklist if active */}
      {isBulkMode && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 no-print">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            เลือกรายชื่อกำลังพลสำหรับพิมพ์แบบกลุ่ม:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allPersonnel.map((p) => {
              const pId = String(p.id);
              const isChecked = selectedIds.includes(pId);
              return (
                <label
                  key={pId}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 font-bold text-primary-900 dark:text-primary-200'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleSelect(pId)}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="truncate">
                    {p.rank || p.prefix || ''} {p.firstName} {p.lastName}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Badge Print Canvas Preview Area */}
      <div className="p-6 sm:p-10 bg-slate-100 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 print:bg-transparent print:border-none print:p-0 flex justify-center">
        <div
          className="flex flex-wrap gap-8 print:gap-[6mm] justify-center print:justify-start"
          style={{ width: paperSettings.pageSize === 'A4' ? '210mm' : 'auto' }}
        >
          {activePersonnelList.map((curPerson) => (
            <div key={curPerson.id} className="flex flex-col items-center print:break-inside-avoid">
              <span className="no-print print:hidden text-slate-500 dark:text-slate-400 text-xs mb-2 text-center font-medium truncate max-w-[216px]">
                {curPerson.firstName} {curPerson.lastName}
              </span>

              {printMode === 'pair' ? (
                <CR80Pair
                  showCropMarks={true}
                  front={
                    <IDBadge
                      personnel={curPerson}
                      settings={settings}
                      qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${curPerson.id}` : ''}
                    />
                  }
                  back={
                    <IDBadge
                      personnel={curPerson}
                      settings={settings}
                      qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${curPerson.id}` : ''}
                      isBack={true}
                    />
                  }
                />
              ) : (
                <div className="relative p-0 print:p-0 shadow-md print:shadow-none rounded-[12px] overflow-hidden">
                  <IDBadge
                    personnel={curPerson}
                    settings={settings}
                    qrValue={typeof window !== 'undefined' ? `${window.location.origin}/verify/${curPerson.id}` : ''}
                    isBack={printMode === 'back'}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { ApprovalTable } from './ApprovalTable';
import { A4PrintLayout } from '@/modules/print';

interface PrintFormLayoutProps {
  formCode?: string;
  formNumber?: string;
  toPerson?: string | null;
  leaveId?: string;
  children: React.ReactNode;
}

export const PrintFormLayout: React.FC<PrintFormLayoutProps> = ({
  formCode,
  formNumber,
  toPerson,
  leaveId,
  children,
}) => {
  const customAction = leaveId ? (
    <div className="flex gap-2">
      <a
        href={`/api/modules/leaves/${leaveId}/pdf`}
        target="_blank"
        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <i className="fa-regular fa-file-pdf"></i>
        <span>ดาวน์โหลด PDF</span>
      </a>
      <a
        href={`/api/modules/leaves/${leaveId}/docx`}
        target="_blank"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <i className="fa-regular fa-file-word"></i>
        <span>ดาวน์โหลด Word</span>
      </a>
    </div>
  ) : undefined;

  return (
    <A4PrintLayout
      documentTitle="ตัวอย่างก่อนพิมพ์ใบลา (Leave Print Preview)"
      backUrl="/modules/leaves"
      backLabel="กลับหน้ารายการลา"
      formNumber={formNumber}
      customAction={customAction}
    >
      {/* Page 1: Official Army Leave Form */}
      <div className="a4-page relative text-black mt-8 print:mt-0 shadow-lg print:shadow-none mx-auto transition-all">
        {(formCode || formNumber) && (
          <div className="text-right leading-tight font-bold text-[11pt] mb-1">
            {formCode && <div>{formCode}</div>}
            {formNumber && <div>{formNumber}</div>}
          </div>
        )}
        {children}
      </div>

      {/* Page 2: Military Chain of Command Routing Table */}
      <div className="a4-page break-before-page relative leading-relaxed mt-8 print:mt-0 shadow-lg print:shadow-none mx-auto transition-all">
        <ApprovalTable toPerson={toPerson ?? null} />
      </div>
    </A4PrintLayout>
  );
};


import React from 'react';
import { ApprovalTable } from './ApprovalTable';

interface PrintFormLayoutProps {
  formNumber?: string;
  toPerson?: string | null;
  children: React.ReactNode;
}

export const PrintFormLayout: React.FC<PrintFormLayoutProps> = ({
  formNumber,
  toPerson,
  children,
}) => {
  return (
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0 font-['Sarabun','TH_Sarabun_New',sans-serif]">
      {/* Page 1: Official Army Leave Form */}
      <div className="a4-page relative text-black">
        {formNumber && (
          <div className="form-number text-right leading-tight font-bold">
            <div>({formNumber})</div>
          </div>
        )}
        {children}
      </div>

      {/* Page 2: Military Chain of Command Routing Table */}
      <div className="a4-page break-before-page relative leading-relaxed mt-8 print:mt-0">
        <ApprovalTable toPerson={toPerson ?? null} />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `setTimeout(function(){window.print();}, 500);`,
        }}
      />
    </div>
  );
};

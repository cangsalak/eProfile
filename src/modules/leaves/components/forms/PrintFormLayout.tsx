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
    <div className="bg-slate-200 min-h-screen py-8 print:bg-white print:py-0">
      <div className="a4-page relative leading-relaxed">
        {formNumber && (
          <div className="absolute top-8 right-8 text-sm text-right leading-tight font-bold">
            <div>{formNumber}</div>
          </div>
        )}
        {children}
      </div>

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

import React from 'react';
import { Personnel } from '@/types/personnel';

interface ExtendedHistoryFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
}

export default function ExtendedHistoryForm({ formData, setFormData }: ExtendedHistoryFormProps) {
  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-clock-rotate-left text-primary-500"></i> ประวัติเพิ่มเติม (Extended History)
      </h4>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ประวัติส่วนตัว / หมายเหตุ (Bio & Notes)
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="รายละเอียดประวัติเพิ่มเติม..."
            className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ประวัติการรับเครื่องราชอิสริยาภรณ์
          </label>
          <textarea
            value={formData.royalDecorations || ''}
            onChange={(e) => setFormData({ ...formData, royalDecorations: e.target.value })}
            rows={3}
            placeholder="ระบุเครื่องราชอิสริยาภรณ์ที่ได้รับ..."
            className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            ประวัติการฝึกอบรม / หลักสูตรพิเศษ
          </label>
          <textarea
            value={formData.trainingHistory || ''}
            onChange={(e) => setFormData({ ...formData, trainingHistory: e.target.value })}
            rows={3}
            placeholder="ระบุหลักสูตรและการฝึกอบรม..."
            className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}

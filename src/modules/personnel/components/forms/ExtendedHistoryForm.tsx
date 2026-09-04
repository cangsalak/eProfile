import React from 'react';
import { Personnel } from '@/types/personnel';

interface ExtendedHistoryFormProps {
  formData: Partial<Personnel>;
  setFormData: (data: Partial<Personnel>) => void;
}

export default function ExtendedHistoryForm({ formData, setFormData }: ExtendedHistoryFormProps) {
  const formControlClass = "form-control resize-none";
  const labelClass = "form-label";


  return (
    <div>
      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-6 flex items-center gap-2">
        <i className="fa-solid fa-clock-rotate-left text-primary-500"></i> ประวัติเพิ่มเติม (Extended History)
      </h4>

      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="extended-notes-textarea" className={labelClass}>
            ประวัติส่วนตัว / หมายเหตุ (Bio & Notes)
          </label>
          <textarea
            id="extended-notes-textarea"
            aria-label="ประวัติส่วนตัว หรือหมายเหตุ"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            placeholder="รายละเอียดประวัติเพิ่มเติม..."
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="extended-decorations-textarea" className={labelClass}>
            ประวัติการรับเครื่องราชอิสริยาภรณ์
          </label>
          <textarea
            id="extended-decorations-textarea"
            aria-label="ประวัติการรับเครื่องราชอิสริยาภรณ์"
            value={formData.royalDecorations || ''}
            onChange={(e) => setFormData({ ...formData, royalDecorations: e.target.value })}
            rows={3}
            placeholder="ระบุเครื่องราชอิสริยาภรณ์ที่ได้รับ..."
            className={formControlClass}
          />
        </div>

        <div>
          <label htmlFor="extended-training-textarea" className={labelClass}>
            ประวัติการฝึกอบรม / หลักสูตรพิเศษ
          </label>
          <textarea
            id="extended-training-textarea"
            aria-label="ประวัติการฝึกอบรม หรือหลักสูตรพิเศษ"
            value={formData.trainingHistory || ''}
            onChange={(e) => setFormData({ ...formData, trainingHistory: e.target.value })}
            rows={3}
            placeholder="ระบุหลักสูตรและการฝึกอบรม..."
            className={formControlClass}
          />
        </div>
      </div>
    </div>
  );
}

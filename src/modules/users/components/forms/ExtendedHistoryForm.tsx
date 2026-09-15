import React from 'react';
import { Personnel } from '@/modules/users';
import { Textarea } from '@/components/ui';

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
        <Textarea
          id="extended-notes-textarea"
          label="ประวัติส่วนตัว / หมายเหตุ (Bio & Notes)"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="รายละเอียดประวัติเพิ่มเติม..."
          className="resize-none"
        />

        <Textarea
          id="extended-decorations-textarea"
          label="ประวัติการรับเครื่องราชอิสริยาภรณ์"
          value={formData.royalDecorations || ''}
          onChange={(e) => setFormData({ ...formData, royalDecorations: e.target.value })}
          rows={3}
          placeholder="ระบุเครื่องราชอิสริยาภรณ์ที่ได้รับ..."
          className="resize-none"
        />

        <Textarea
          id="extended-training-textarea"
          label="ประวัติการฝึกอบรม / หลักสูตรพิเศษ"
          value={formData.trainingHistory || ''}
          onChange={(e) => setFormData({ ...formData, trainingHistory: e.target.value })}
          rows={3}
          placeholder="ระบุหลักสูตรและการฝึกอบรม..."
          className="resize-none"
        />
      </div>
    </div>
  );
}

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEventItem {
  id: string;
  title: string;
  description: string | null;
  startDate: string; // ISO string
  endDate: string; // ISO string
  type: string; // 'operation' | 'leave' | 'meeting' | 'notification' | 'google' | 'general'
  status: string;
  allDay?: boolean;
  location?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  dutyRole?: string | null; // e.g. 'นายทหารเวร', 'นายสิบเวร', 'พลขับเวร', 'ผู้รับผิดชอบ'
  color?: string;
  originalData?: any;
}

export interface CalendarFilterState {
  operation: boolean;
  leave: boolean;
  meeting: boolean;
  notification: boolean;
  google: boolean;
  general: boolean;
}

export const CALENDAR_CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; bgLight: string; bgDark: string; borderLight: string; borderDark: string; dotColor: string }
> = {
  operation: {
    label: 'เวรปฏิบัติการ / ภารกิจ',
    color: 'text-sky-700 dark:text-sky-300',
    bgLight: 'bg-sky-100/90 text-sky-800 border-sky-300',
    bgDark: 'dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800',
    borderLight: 'border-sky-300',
    borderDark: 'dark:border-sky-700',
    dotColor: 'bg-sky-500',
  },
  leave: {
    label: 'การลาของกำลังพล',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgLight: 'bg-emerald-100/90 text-emerald-800 border-emerald-300',
    bgDark: 'dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800',
    borderLight: 'border-emerald-300',
    borderDark: 'dark:border-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  meeting: {
    label: 'การประชุม / นัดหมาย',
    color: 'text-violet-700 dark:text-violet-300',
    bgLight: 'bg-violet-100/90 text-violet-800 border-violet-300',
    bgDark: 'dark:bg-violet-950/60 dark:text-violet-200 dark:border-violet-800',
    borderLight: 'border-violet-300',
    borderDark: 'dark:border-violet-700',
    dotColor: 'bg-violet-500',
  },
  notification: {
    label: 'แจ้งเตือน / วันสำคัญ',
    color: 'text-amber-700 dark:text-amber-300',
    bgLight: 'bg-amber-100/90 text-amber-800 border-amber-300',
    bgDark: 'dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800',
    borderLight: 'border-amber-300',
    borderDark: 'dark:border-amber-700',
    dotColor: 'bg-amber-500',
  },
  google: {
    label: 'Google Calendar Sync',
    color: 'text-blue-700 dark:text-blue-300',
    bgLight: 'bg-blue-100/90 text-blue-800 border-blue-300',
    bgDark: 'dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800',
    borderLight: 'border-blue-300',
    borderDark: 'dark:border-blue-700',
    dotColor: 'bg-blue-500',
  },
  general: {
    label: 'กิจกรรมทั่วไป',
    color: 'text-slate-700 dark:text-slate-300',
    bgLight: 'bg-slate-100 text-slate-800 border-slate-300',
    bgDark: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    borderLight: 'border-slate-300',
    borderDark: 'dark:border-slate-700',
    dotColor: 'bg-slate-500',
  },
};

export const DEFAULT_DUTY_ROLES: string[] = [
  'นายทหารเวรผู้ใหญ่',
  'นายทหารเวร',
  'ผบ.กองรักษาการณ์',
  'ผช.ผบ.กองรักษาการณ์ (1)',
  'ผช.ผบ.กองรักษาการณ์ (2)',
  'สิบเวร ร้อย.บร.',
  'สิบเวร ฝขส.ฯ',
  'สิบเวร กคค./กตส.ปม.ฯ',
  'สิบเวรโรงเลี้ยง',
  'เสมียนเวร',
];

import { ModuleDefinition } from '@/modules/core/types';
import { CalendarManifest } from './manifest';
import DutyCalendarView from './views/DutyCalendarView';
import CalendarSettingsView from './views/CalendarSettingsView';
import DutyCalendarWidget from './widgets/DutyCalendarWidget';


export * from './manifest';
export { default as DutyCalendarView } from './views/DutyCalendarView';
export { default as CalendarSettingsView } from './views/CalendarSettingsView';
export { default as DutyCalendarWidget } from './widgets/DutyCalendarWidget';
export { CalendarView } from './components/CalendarView';

export const CalendarModule: ModuleDefinition = {
  manifest: CalendarManifest,
  views: {
    '': DutyCalendarView,
    'duty': DutyCalendarView,
    'settings': CalendarSettingsView,
  },
  widgets: {
    'calendar-quick-widget': DutyCalendarWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

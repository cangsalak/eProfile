import { ModuleDefinition } from '@/modules/core/types';
import { CalendarManifest } from './manifest';
import DutyCalendarView from './views/DutyCalendarView';
import CalendarSettingsView from './views/CalendarSettingsView';

export * from './manifest';
export { default as DutyCalendarView } from './views/DutyCalendarView';
export { default as CalendarSettingsView } from './views/CalendarSettingsView';
export { CalendarView } from './components/CalendarView';

export const CalendarModule: ModuleDefinition = {
  manifest: CalendarManifest,
  views: {
    '': DutyCalendarView,
    'duty': DutyCalendarView,
    'settings': CalendarSettingsView,
  },
};

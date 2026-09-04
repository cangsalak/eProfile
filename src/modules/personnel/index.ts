import { ModuleDefinition } from '@/lib/modules/types';
import { PersonnelManifest } from './manifest';
import MainDashboardView from './views/MainDashboardView';
import ManagePersonnelView from './views/ManagePersonnelView';
import DirectoryView from './views/DirectoryView';
import ProfileView from './views/ProfileView';
import RoleSettingsView from './views/RoleSettingsView';
import DepartmentsSettingsView from './views/DepartmentsSettingsView';

export * from './manifest';
export { default as ManagePersonnelView } from './views/ManagePersonnelView';
export { default as RoleSettingsView } from './views/RoleSettingsView';
export * from './views/ManagePersonnelView';
export { default as ProfileView } from './views/ProfileView';
export * from './views/ProfileView';
export { default as DirectoryView } from './views/DirectoryView';
export * from './views/DirectoryView';
export { default as MainDashboardView } from './views/MainDashboardView';
export * from './views/MainDashboardView';
export { default as DepartmentsSettingsView } from './views/DepartmentsSettingsView';

export { default as DepartmentsManager } from './settings/DepartmentsManager';
export * from './settings/DepartmentsManager';

export const PersonnelModule: ModuleDefinition = {
  manifest: PersonnelManifest,
  views: {
    '': MainDashboardView,
    'manage': ManagePersonnelView,
    'directory': DirectoryView,
    'profile': ProfileView,
    'roles': RoleSettingsView,
    'departments': DepartmentsSettingsView,
  },
};

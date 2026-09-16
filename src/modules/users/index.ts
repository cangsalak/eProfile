import { ModuleDefinition } from '@/modules/core/types';
import { UsersManifest } from './manifest';
import MainDashboardView from './views/MainDashboardView';
import ManagePersonnelView from './views/ManagePersonnelView';
import DirectoryView from './views/DirectoryView';
import ProfileView from './views/ProfileView';
import RoleSettingsView from './views/RoleSettingsView';
import DepartmentsSettingsView from './views/DepartmentsSettingsView';
import PersonnelFormView from './views/PersonnelFormView';
import Rpb1FormView from './views/rpb1/Rpb1FormView';

export * from './manifest';
export * from './types';
export * from './constants';
export * from './components/dropdowns';
export * from './lib/excelUtils';
export { default as ManagePersonnelView } from './views/ManagePersonnelView';
export { default as RoleSettingsView } from './views/RoleSettingsView';
export { default as ProfileView } from './views/ProfileView';
export { default as DirectoryView } from './views/DirectoryView';
export { default as MainDashboardView } from './views/MainDashboardView';
export { default as DepartmentsSettingsView } from './views/DepartmentsSettingsView';
export { default as DepartmentsManager } from './settings/DepartmentsManager';
export { default as PersonnelFormView } from './views/PersonnelFormView';
export { default as Rpb1FormView } from './views/rpb1/Rpb1FormView';
export { default as Rpb1ProgressSection, calculateRpb1Progress } from './components/rpb1/Rpb1ProgressSection';

export const UsersModule: ModuleDefinition = {
  manifest: UsersManifest,
  views: {
    '': MainDashboardView,
    'manage': ManagePersonnelView,
    'directory': DirectoryView,
    'profile': ProfileView,
    'roles': RoleSettingsView,
    'departments': DepartmentsSettingsView,
    'new': PersonnelFormView,
    'manage/new': PersonnelFormView,
    'edit': PersonnelFormView,
    'manage/edit': PersonnelFormView,
    'form': PersonnelFormView,
    'rpb1/form': Rpb1FormView,
  },
};

// Backward compat alias
export const PersonnelModule = UsersModule;

import { ModuleDefinition } from '@/modules/core/types';
import { UsersManifest } from './manifest';
import MainDashboardView from './views/MainDashboardView';
import ManagePersonnelView from './views/ManagePersonnelView';
import DirectoryView from './views/DirectoryView';
import ProfileView from './views/ProfileView';
import RoleSettingsView from './views/RoleSettingsView';
import DepartmentsSettingsView from './views/DepartmentsSettingsView';

export * from './manifest';
export * from './types';
export * from './lib/excelUtils';
export { default as ManagePersonnelView } from './views/ManagePersonnelView';
export { default as RoleSettingsView } from './views/RoleSettingsView';
export { default as ProfileView } from './views/ProfileView';
export { default as DirectoryView } from './views/DirectoryView';
export { default as MainDashboardView } from './views/MainDashboardView';
export { default as DepartmentsSettingsView } from './views/DepartmentsSettingsView';
export { default as DepartmentsManager } from './settings/DepartmentsManager';

export const UsersModule: ModuleDefinition = {
  manifest: UsersManifest,
  views: {
    '': MainDashboardView,
    'manage': ManagePersonnelView,
    'directory': DirectoryView,
    'profile': ProfileView,
    'roles': RoleSettingsView,
    'departments': DepartmentsSettingsView,
  },
};

// Backward compat alias
export const PersonnelModule = UsersModule;

import { ModuleDefinition } from '@/lib/modules/types';
import { SystemInspectorManifest } from './manifest';
import SystemInspectorView from './views/SystemInspectorView';
import AuditLogsView from './views/AuditLogsView';
import ApiDocsView from './views/ApiDocsView';
import ManageModulesView from './views/ManageModulesView';
import DataCategorySettingsView from './views/DataCategorySettingsView';

export * from './manifest';
export { default as SystemInspectorView } from './views/SystemInspectorView';
export { default as DataCategorySettingsView } from './views/DataCategorySettingsView';
export { default as AuditLogsView } from './views/AuditLogsView';
export { default as ApiDocsView } from './views/ApiDocsView';
export { default as ManageModulesView } from './views/ManageModulesView';
export { default as ModuleManagerSettings } from './components/ModuleManagerSettings';


export const SystemInspectorModule: ModuleDefinition = {
  manifest: SystemInspectorManifest,
  views: {
    '': SystemInspectorView,
    'audit-logs': AuditLogsView,
    'api-docs': ApiDocsView,
    'modules': ManageModulesView,
    'settings': DataCategorySettingsView,
    'categories': DataCategorySettingsView,
  },
};

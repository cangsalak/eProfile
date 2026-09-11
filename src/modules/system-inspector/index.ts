import { ModuleDefinition } from '@/lib/modules/types';
import { SystemInspectorManifest } from './manifest';
import SystemInspectorView from './views/SystemInspectorView';
import AuditLogsView from './views/AuditLogsView';
import DataCategorySettingsView from './views/DataCategorySettingsView';

export * from './manifest';
export { default as SystemInspectorView } from './views/SystemInspectorView';
export { default as DataCategorySettingsView } from './views/DataCategorySettingsView';
export { default as AuditLogsView } from './views/AuditLogsView';

export const SystemInspectorModule: ModuleDefinition = {
  manifest: SystemInspectorManifest,
  views: {
    '': SystemInspectorView,
    'audit-logs': AuditLogsView,
    'settings': DataCategorySettingsView,
    'categories': DataCategorySettingsView,
  },
};

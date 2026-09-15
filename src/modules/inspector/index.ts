import { ModuleDefinition } from '@/modules/core/types';
import { InspectorManifest } from './manifest';
import HealthView from './views/HealthView';
import PerformanceView from './views/PerformanceView';
import RouteMapView from './views/RouteMapView';
import ModuleHealthView from './views/ModuleHealthView';
import ErrorLogView from './views/ErrorLogView';
import AuditLogsView from './views/AuditLogsView';
import DatabaseView from './views/DatabaseView';
import EnvironmentView from './views/EnvironmentView';
import SecurityScanView from './views/SecurityScanView';
import SystemInspectorView from './views/SystemInspectorView';
import DataCategorySettingsView from './views/DataCategorySettingsView';
import DevChecklistView from './views/DevChecklistView';

export * from './manifest';
export * from './lib';

export { default as InspectorFloatingButton } from './components/InspectorFloatingButton';
export { default as InspectorModal } from './components/InspectorModal';
export { default as DataCategorySettings } from './components/DataCategorySettings';

export {
  HealthView,
  DevChecklistView,
  PerformanceView,
  RouteMapView,
  ModuleHealthView,
  ErrorLogView,
  AuditLogsView,
  DatabaseView,
  EnvironmentView,
  SecurityScanView,
  SystemInspectorView,
  DataCategorySettingsView,
};

export const InspectorModule: ModuleDefinition = {
  manifest: InspectorManifest,
  views: {
    '': HealthView,
    'health': HealthView,
    'checklist': DevChecklistView,
    'dev-checklist': DevChecklistView,
    'performance': PerformanceView,
    'routes': RouteMapView,
    'modules': ModuleHealthView,
    'errors': ErrorLogView,
    'audit-logs': AuditLogsView,
    'database': DatabaseView,
    'environment': EnvironmentView,
    'security': SecurityScanView,
    'scan': SystemInspectorView,
    'inspector': SystemInspectorView,
    'categories': DataCategorySettingsView,
    'settings': DataCategorySettingsView,
  },
};

// Backward compatibility aliases
export const SystemInspectorModule = InspectorModule;

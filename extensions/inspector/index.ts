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

import InspectorStatusWidget from './widgets/InspectorStatusWidget';

// api is imported directly by api-registry.ts — do NOT re-import here to avoid
// pulling next/headers (server-only) into the client component bundle.

export * from './manifest';
export * from './lib';
// InspectorApi is NOT re-exported here on purpose (see comment above).

export { default as InspectorFloatingButton } from './components/InspectorFloatingButton';
export { default as InspectorModal } from './components/InspectorModal';
export { default as DataCategorySettings } from './components/DataCategorySettings';
export { default as InspectorStatusWidget } from './widgets/InspectorStatusWidget';

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
  widgets: {
    'inspector-status-widget': InspectorStatusWidget,
  },
  // api routes are registered centrally in api-registry.ts to avoid importing
  // server-only modules (next/headers) into the client component bundle.
  api: {},
};

// Backward compatibility aliases
export const SystemInspectorModule = InspectorModule;

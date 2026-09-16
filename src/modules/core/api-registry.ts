import { ModuleApiRouteMap } from './types';
import * as LeavesApi from '@/modules/leaves/api';
import * as BadgesApi from '@/modules/badges/api';
import * as CalendarApi from '@/modules/calendar/api';
import * as NewsApi from '@/modules/news/api';
import * as UploadApi from '@/modules/upload/api';
import * as DashboardApi from '@/modules/dashboard/api';
import * as ApiDocsApi from '@/modules/api-docs/api';
import * as BackupApi from '@/modules/backup/api';
import * as ModuleManagerApi from '@/modules/module-manager/api';
import * as InspectorApi from '@/modules/inspector/api';
import * as SiteApi from '@/modules/site/api';
import * as RolesApi from '@/modules/roles/api';
import * as UsersApi from '@/modules/users/api';
import * as ContactsApi from '@/modules/contacts/api';

import * as AuthApi from '@/modules/auth/api';
import * as InstallApi from '@/modules/install/api';
import * as CoreApi from './api';

export const BUILTIN_MODULE_APIS: Record<string, ModuleApiRouteMap> = {
  'settings': {
    '': {
      GET: CoreApi.handleGetSettings as any,
      POST: CoreApi.handleUpdateSettings as any,
      PUT: CoreApi.handleUpdateSettings as any,
    },
    'maintenance': {
      GET: CoreApi.handleGetMaintenance as any,
      POST: CoreApi.handleUpdateMaintenance as any,
      PUT: CoreApi.handleUpdateMaintenance as any,
    },
    'reset-db': {
      POST: CoreApi.handleResetDatabase as any,
    },
  },
  'install': {
    '': {
      POST: InstallApi.handleInstall as any,
    },
    'test-db': {
      POST: InstallApi.handleTestDb as any,
    },
  },
  'auth': {
    'login': {
      POST: AuthApi.handleLogin as any,
    },
    'logout': {
      POST: AuthApi.handleLogout as any,
    },
    'me': {
      GET: AuthApi.handleGetMe as any,
    },
    'forgot-password': {
      POST: AuthApi.handleForgotPassword as any,
    },
    'reset-password': {
      POST: AuthApi.handleResetPassword as any,
    },
    'setup-admin': {
      POST: AuthApi.handleSetupAdmin as any,
    },
  },
  'users': {
    '': {
      GET: UsersApi.handleGetPersonnel as any,
      POST: UsersApi.handleCreatePersonnel as any,
    },
    'stats': {
      GET: UsersApi.handleGetPersonnelStats as any,
    },
    'export': {
      GET: UsersApi.handleExportPersonnel as any,
    },
    '[id]': {
      GET: UsersApi.handleGetPersonnelById as any,
      PUT: UsersApi.handleUpdatePersonnelById as any,
      DELETE: UsersApi.handleDeletePersonnelById as any,
    },
    '[id]/documents': {
      GET: UsersApi.handleGetDocuments as any,
      POST: UsersApi.handleCreateDocument as any,
    },
    'departments': {
      GET: UsersApi.handleGetDepartments as any,
      POST: UsersApi.handleCreateDepartment as any,
    },
    'departments/[id]': {
      PUT: UsersApi.handleUpdateDepartment as any,
      DELETE: UsersApi.handleDeleteDepartment as any,
    },
    'rpb1': {
      GET: UsersApi.handleGetRpb1List as any,
    },
    'rpb1/[id]': {
      GET: UsersApi.handleGetRpb1ByPersonnelId as any,
      POST: UsersApi.handleSaveRpb1ByPersonnelId as any,
    },
  },
  'personnel': {
    '': {
      GET: UsersApi.handleGetPersonnel as any,
      POST: UsersApi.handleCreatePersonnel as any,
    },
    'stats': {
      GET: UsersApi.handleGetPersonnelStats as any,
    },
    'export': {
      GET: UsersApi.handleExportPersonnel as any,
    },
    '[id]': {
      GET: UsersApi.handleGetPersonnelById as any,
      PUT: UsersApi.handleUpdatePersonnelById as any,
      DELETE: UsersApi.handleDeletePersonnelById as any,
    },
    '[id]/documents': {
      GET: UsersApi.handleGetDocuments as any,
      POST: UsersApi.handleCreateDocument as any,
    },
  },
  'departments': {
    '': {
      GET: UsersApi.handleGetDepartments as any,
      POST: UsersApi.handleCreateDepartment as any,
    },
    '[id]': {
      PUT: UsersApi.handleUpdateDepartment as any,
      DELETE: UsersApi.handleDeleteDepartment as any,
    },
  },
  'contacts': {
    '': {
      GET: ContactsApi.handleGetContacts as any,
      POST: ContactsApi.handleCreateContact as any,
    },
  },

  'roles': {
    '': {
      GET: RolesApi.handleGetRoles as any,
      POST: RolesApi.handleCreateRole as any,
    },
    '[id]': {
      PUT: RolesApi.handleUpdateRole as any,
      DELETE: RolesApi.handleDeleteRole as any,
    },
  },
  'site': {
    '': {
      GET: SiteApi.handleGetSiteContent as any,
      POST: SiteApi.handleSaveSiteContent as any,
    },
    'services': {
      GET: SiteApi.handleGetServices as any,
      POST: SiteApi.handleCreateService as any,
    },
    'services/[id]': {
      PUT: SiteApi.handleUpdateService as any,
      DELETE: SiteApi.handleDeleteService as any,
    },
  },
  'site-content': {
    '': {
      GET: SiteApi.handleGetSiteContent as any,
      POST: SiteApi.handleSaveSiteContent as any,
    },
    'services': {
      GET: SiteApi.handleGetServices as any,
      POST: SiteApi.handleCreateService as any,
    },
    'services/[id]': {
      PUT: SiteApi.handleUpdateService as any,
      DELETE: SiteApi.handleDeleteService as any,
    },
  },
  'inspector': {
    '': {
      GET: InspectorApi.handleListInspections as any,
      POST: InspectorApi.handleCreateInspection as any,
    },
    'health': { GET: InspectorApi.handleGetHealth as any },
    'performance': { GET: InspectorApi.handleGetPerformance as any },
    'routes': { GET: InspectorApi.handleGetRoutes as any },
    'modules': { GET: InspectorApi.handleGetModules as any },
    'errors': { GET: InspectorApi.handleGetErrors as any },
    'database': { GET: InspectorApi.handleGetDatabase as any },
    'environment': { GET: InspectorApi.handleGetEnvironment as any },
    'security': { GET: InspectorApi.handleGetSecurity as any },
    'audit-logs': { GET: InspectorApi.handleGetAuditLogs as any },
    '[id]': {
      GET: InspectorApi.handleGetInspection as any,
      DELETE: InspectorApi.handleDeleteInspection as any,
    },
    '[id]/findings/[findingId]': {
      PATCH: InspectorApi.handleUpdateFinding as any,
    },
    'check-headers': { GET: InspectorApi.handleCheckHeaders as any },
    'checklist': { GET: InspectorApi.handleGetChecklist as any },
  },
  'leaves': {
    '': {
      GET: LeavesApi.handleGetLeaves as any,
      POST: LeavesApi.handleCreateLeave as any,
    },
    '[id]': {
      PUT: LeavesApi.handleUpdateLeave as any,
      DELETE: LeavesApi.handleDeleteLeave as any,
    },
    '[id]/approve': {
      POST: LeavesApi.handleApproveLeave as any,
    },
    '[id]/reject': {
      POST: LeavesApi.handleRejectLeave as any,
    },
    'approvals': {
      GET: LeavesApi.handleGetLeaveApprovals as any,
    },
  },
  'badges': {
    'verify/[id]': {
      GET: BadgesApi.handleVerifyPersonnel as any,
    },
  },
  'calendar': {
    '': {
      GET: CalendarApi.handleGetCalendarEvents as any,
      POST: CalendarApi.handleCreateCalendarEvent as any,
    },
    '[id]': {
      PUT: CalendarApi.handleUpdateCalendarEvent as any,
      DELETE: CalendarApi.handleDeleteCalendarEvent as any,
    },
    'feed': {
      GET: CalendarApi.handleGetCalendarFeed as any,
    },
  },
  'news': {
    'posts': {
      GET: NewsApi.handleGetPosts as any,
      POST: NewsApi.handleCreatePost as any,
    },
    'posts/[id]': {
      PUT: NewsApi.handleUpdatePost as any,
      DELETE: NewsApi.handleDeletePost as any,
    },
    'notifications': {
      GET: NewsApi.handleGetNotifications as any,
      POST: NewsApi.handleBroadcastNotification as any,
      PUT: NewsApi.handleMarkAllNotificationsRead as any,
    },
    'notifications/[id]': {
      PUT: NewsApi.handleUpdateSingleNotification as any,
      DELETE: NewsApi.handleDeleteSingleNotification as any,
    },
    'notifications/history': {
      GET: NewsApi.handleGetNotificationHistory as any,
    },
    'notifications/test': {
      POST: NewsApi.handleTestNotification as any,
    },
  },
  'upload': {
    '': {
      GET: UploadApi.handleListMedia as any,
      POST: UploadApi.handleUploadMedia as any,
    },
    'upload': {
      POST: UploadApi.handleUploadMedia as any,
    },
    'list': {
      GET: UploadApi.handleListMedia as any,
    },
    '[id]': {
      DELETE: UploadApi.handleDeleteMedia as any,
    },
    's3-settings': {
      GET: UploadApi.handleGetStorageSettings as any,
      PUT: UploadApi.handleSaveStorageSettings as any,
      POST: UploadApi.handleTestStorageConnection as any,
    },
  },
  'dashboard': {
    '': {
      GET: DashboardApi.handleGetDashboardStats as any,
    },
    'stats': {
      GET: DashboardApi.handleGetDashboardStats as any,
    },
    'command': {
      GET: DashboardApi.handleGetCommandDashboard as any,
    },
  },
  'api-docs': {
    '': { GET: ApiDocsApi.handleGetApiDocs as any },
    'docs': { GET: ApiDocsApi.handleGetApiDocs as any },
    'tokens': {
      GET: ApiDocsApi.handleListApiTokens as any,
      POST: ApiDocsApi.handleCreateApiToken as any,
    },
    'tokens/[id]': {
      PATCH: ApiDocsApi.handleUpdateApiTokenStatus as any,
      DELETE: ApiDocsApi.handleDeleteApiToken as any,
    },
  },
  'backup': {
    '': {
      GET: BackupApi.handleGetBackup as any,
    },
    'list': {
      GET: BackupApi.handleListBackups as any,
      DELETE: BackupApi.handleCleanupBackups as any,
    },
    'restore': {
      POST: BackupApi.handleRestoreDatabase as any,
    },
  },
  'module-manager': {
    '': {
      GET: ModuleManagerApi.handleGetModules as any,
    },
    'install': {
      POST: ModuleManagerApi.handleInstallModule as any,
    },
    'update': {
      POST: ModuleManagerApi.handleUpdateModule as any,
    },
    '[id]': {
      DELETE: ModuleManagerApi.handleUninstallModule as any,
    },
    'template': {
      GET: ModuleManagerApi.handleGetModuleTemplate as any,
    },
  },
};

export class ModuleApiRegistry {
  private static customApis: Map<string, ModuleApiRouteMap> = new Map();

  static register(moduleId: string, apiMap: ModuleApiRouteMap): void {
    this.customApis.set(moduleId, apiMap);
  }

  static get(moduleId: string): ModuleApiRouteMap | undefined {
    return BUILTIN_MODULE_APIS[moduleId] || this.customApis.get(moduleId);
  }
}

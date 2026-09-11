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

export const BUILTIN_MODULE_APIS: Record<string, ModuleApiRouteMap> = {
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

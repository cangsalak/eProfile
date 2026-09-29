import { ModuleDefinition } from '@/modules/core/types';
import { NewsManifest } from './manifest';
import NewsDashboardView from './views/NewsDashboardView';
import NotificationsInboxView from './views/NotificationsInboxView';
import NotificationSettingsView from './views/NotificationSettingsView';
import MediaManagerView from './views/MediaManagerView';
import UnifiedCommunicationsManager from './components/UnifiedCommunicationsManager';
import NotificationSettings from './components/NotificationSettings';
import NewsAnnouncementsWidget from './widgets/NewsAnnouncementsWidget';


export * from './manifest';

export { default as NewsDashboardView } from './views/NewsDashboardView';
export { default as NotificationsInboxView } from './views/NotificationsInboxView';
export { default as NotificationSettingsView } from './views/NotificationSettingsView';
export { default as MediaManagerView } from './views/MediaManagerView';
export { default as UnifiedCommunicationsManager } from './components/UnifiedCommunicationsManager';
export { default as NotificationSettings } from './components/NotificationSettings';
export { default as NewsAnnouncementsWidget } from './widgets/NewsAnnouncementsWidget';

export const NewsModule: ModuleDefinition = {
  manifest: NewsManifest,
  views: {
    '': NewsDashboardView,
    'index': NewsDashboardView,
    'manage': NewsDashboardView,
    'inbox': NotificationsInboxView,
    'notifications': NotificationsInboxView,
    'settings': NotificationSettingsView,
    'media': MediaManagerView,
  },
  widgets: {
    'news-announcements-widget': NewsAnnouncementsWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

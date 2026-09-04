export * from './manifest';
import { NewsManifest } from './manifest';
import { ModuleDefinition } from '@/lib/modules/types';
import UnifiedCommunicationsManager from './components/UnifiedCommunicationsManager';
import NotificationSettingsView from './views/NotificationSettingsView';
import NotificationsInboxView from './views/NotificationsInboxView';
import MediaManagerView from './views/MediaManagerView';

export { default as UnifiedCommunicationsManager } from './components/UnifiedCommunicationsManager';
export * from './components/UnifiedCommunicationsManager';
export { default as NotificationSettingsView } from './views/NotificationSettingsView';
export * from './views/NotificationSettingsView';
export { default as NotificationsInboxView } from './views/NotificationsInboxView';
export * from './views/NotificationsInboxView';
export { default as MediaManagerView } from './views/MediaManagerView';
export * from './views/MediaManagerView';

export const NewsModule: ModuleDefinition = {
  manifest: NewsManifest,
  views: {
    '': UnifiedCommunicationsManager,
    'index': UnifiedCommunicationsManager,
    'manage': UnifiedCommunicationsManager,
    'inbox': NotificationsInboxView,
    'media': MediaManagerView,
    'settings': NotificationSettingsView,
  },
};


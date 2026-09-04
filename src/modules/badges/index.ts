import { ModuleDefinition } from '@/lib/modules/types';
import { BadgesManifest } from './manifest';
import BulkBadgePrintView from './views/BulkBadgePrintView';
import MyBadgesView from './views/MyBadgesView';
import MemberVerifyBadgeView from './views/MemberVerifyBadgeView';
import BadgeSettingsView from './views/BadgeSettingsView';

export * from './manifest';
export { default as BulkBadgePrintView } from './views/BulkBadgePrintView';
export * from './views/BulkBadgePrintView';
export { default as MyBadgesView } from './views/MyBadgesView';
export * from './views/MyBadgesView';
export { default as MemberVerifyBadgeView } from './views/MemberVerifyBadgeView';
export * from './views/MemberVerifyBadgeView';
export { default as BadgeSettingsView } from './views/BadgeSettingsView';
export { default as BadgeDesignSettings } from './settings/BadgeDesignSettings';
export * from './settings/BadgeDesignSettings';

export const BadgesModule: ModuleDefinition = {
  manifest: BadgesManifest,
  views: {
    '': BulkBadgePrintView,
    'my': MyBadgesView,
    'verify': MemberVerifyBadgeView,
    'settings': BadgeSettingsView,
  },
};

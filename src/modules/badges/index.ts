import { ModuleDefinition } from '@/modules/core/types';
import { BadgesManifest } from './manifest';
import BulkBadgePrintView from './views/BulkBadgePrintView';
import MyBadgesView from './views/MyBadgesView';
import MemberVerifyBadgeView from './views/MemberVerifyBadgeView';
import BadgeSettingsView from './views/BadgeSettingsView';

export * from './manifest';
export * from './constants';
export { default as CR80Card } from './components/CR80Card';
export { default as CR80Pair } from './components/CR80Pair';
export { default as BulkBadgePrintView } from './views/BulkBadgePrintView';
export { default as MyBadgesView } from './views/MyBadgesView';
export { default as MemberVerifyBadgeView } from './views/MemberVerifyBadgeView';
export { default as BadgeSettingsView } from './views/BadgeSettingsView';
export { default as BadgeDesignSettings } from './settings/BadgeDesignSettings';

export const BadgesModule: ModuleDefinition = {
  manifest: BadgesManifest,
  views: {
    '': BulkBadgePrintView,
    'print': BulkBadgePrintView,
    'my': MyBadgesView,
    'verify': MemberVerifyBadgeView,
    'settings': BadgeSettingsView,
  },
};

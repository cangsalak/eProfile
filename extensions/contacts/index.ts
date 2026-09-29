import { ModuleDefinition } from '@/modules/core/types';
import { ContactsManifest } from './manifest';
import ManageContactsView from './views/ManageContactsView';
import PublicContactView from './views/PublicContactView';
import ContactsInboxWidget from './widgets/ContactsInboxWidget';


export * from './manifest';
export { default as PublicContactView } from './views/PublicContactView';
export { default as ManageContactsView } from './views/ManageContactsView';
export { default as ContactsInboxWidget } from './widgets/ContactsInboxWidget';

export const ContactsModule: ModuleDefinition = {
  manifest: ContactsManifest,
  views: {
    '': ManageContactsView,
    'public': PublicContactView,
  },
  widgets: {
    'contacts-inbox-widget': ContactsInboxWidget,
  },
  // api routes registered centrally in api-registry.ts (server-only — do NOT import here)
  api: {},
};

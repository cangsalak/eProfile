import { ModuleDefinition } from '@/lib/modules/types';
import { ContactsManifest } from './manifest';
import ManageContactsView from './views/ManageContactsView';
import PublicContactView from './views/PublicContactView';

export * from './manifest';
export { default as PublicContactView } from './views/PublicContactView';
export { default as ManageContactsView } from './views/ManageContactsView';
export * from './views/PublicContactView';
export * from './views/ManageContactsView';

export const ContactsModule: ModuleDefinition = {
  manifest: ContactsManifest,
  views: {
    '': ManageContactsView,
    'public': PublicContactView,
  },
};

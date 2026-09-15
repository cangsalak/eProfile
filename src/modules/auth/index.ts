import { ModuleDefinition } from '@/modules/core/types';
import { AuthManifest } from './manifest';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ForgotPasswordView from './views/ForgotPasswordView';

export * from './manifest';
export { default as LoginView } from './views/LoginView';
export { default as RegisterView } from './views/RegisterView';
export { default as ForgotPasswordView } from './views/ForgotPasswordView';
export { default as LoginModal } from './components/LoginModal';

export const AuthModule: ModuleDefinition = {
  manifest: AuthManifest,
  views: {
    '': LoginView,
    'login': LoginView,
    'register': RegisterView,
    'forgot-password': ForgotPasswordView,
  },
};


import { handleInstallModule } from '@/modules/module-manager/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleInstallModule(request);
}

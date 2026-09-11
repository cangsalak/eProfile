import { handleGetModules } from '@/modules/module-manager/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleGetModules(request);
}

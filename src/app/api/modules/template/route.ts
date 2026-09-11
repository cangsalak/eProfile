import { handleGetModuleTemplate } from '@/modules/module-manager/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleGetModuleTemplate(request);
}

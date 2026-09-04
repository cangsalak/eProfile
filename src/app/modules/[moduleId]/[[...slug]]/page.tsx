import DynamicModuleHost from '@/components/modules/DynamicModuleHost';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string; slug?: string[] }>;
}) {
  const { moduleId, slug } = await params;
  return <DynamicModuleHost moduleId={moduleId} slug={slug} />;
}

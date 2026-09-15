import DynamicModuleHost from '@/modules/core/components/DynamicModuleHost';

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string; slug?: string[] }>;
}) {
  const { moduleId, slug } = await params;
  return <DynamicModuleHost moduleId={moduleId} slug={slug} />;
}

import LeavePrintView from '@/modules/leaves/views/LeavePrintView';

export default async function LeavePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <LeavePrintView params={resolved} />;
}

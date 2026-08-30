import { redirect } from 'next/navigation'

export default async function LegacySharedStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/s/${id}`)
}

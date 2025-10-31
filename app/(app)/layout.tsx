import { getUserOrRedirect } from '@/lib/auth'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getUserOrRedirect()

  return (
    <div className="min-h-screen gradient-app text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        {children}
      </div>
    </div>
  )
}


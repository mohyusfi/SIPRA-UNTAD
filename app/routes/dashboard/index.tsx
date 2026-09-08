import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUserSession } from '~/lib/auth-server'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const session = await getCurrentUserSession()

    if (!session?.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      })
    }

    const role = (session.user as any).role || 'reporter'

    switch (role) {
      case 'admin':
        throw redirect({ to: '/dashboard/admin' as any })
      case 'technician':
        throw redirect({ to: '/dashboard/technician' as any })
      case 'monitor':
        throw redirect({ to: '/dashboard/monitor' as any })
      case 'reporter':
      default:
        throw redirect({ to: '/dashboard/reporter' as any })
    }
  },
  component: DashboardRedirector,
})

function DashboardRedirector() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#DDD6FE]">
      <div className="p-6 bg-white border-2 border-[#09090B] shadow-neo text-center">
        <div className="text-sm font-bold text-[#09090B]">
          Mengarahkan ke dashboard peran Anda...
        </div>
      </div>
    </div>
  )
}

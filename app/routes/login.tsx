import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { getCurrentUserSession } from '~/lib/auth-server'
import { PublicNavbar } from '~/components/layout/public-navbar'
import { LoginForm } from '~/features/auth/components/login-form'

const loginSearchSchema = z.object({
  error: z.string().optional(),
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [
      {
        title: 'Masuk Sistem | SIPENAD',
      },
      {
        name: 'description',
        content:
          'Masuk ke sistem SIPENAD untuk mengelola laporan kerusakan infrastruktur kampus Universitas Tadulako.',
      },
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) =>
    loginSearchSchema.parse(search),
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (session?.user) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { error, redirect: redirectParam } = Route.useSearch()

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <PublicNavbar subtitle="Masuk Sistem SIPENAD" />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 py-8 md:py-12">
        <LoginForm initialError={error} redirectUrl={redirectParam} />
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Sistem Informasi Pelaporan Infrastruktur Untad • WITA (UTC+8)
      </footer>
    </div>
  )
}

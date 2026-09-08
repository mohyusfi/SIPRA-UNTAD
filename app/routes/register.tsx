import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUserSession } from '~/lib/auth-server'
import { PublicNavbar } from '~/components/layout/public-navbar'
import { RegisterForm } from '~/features/auth/components/register-form'

export const Route = createFileRoute('/register')({
  head: () => ({
    meta: [
      {
        title: 'Daftar Akun Pelapor | SIPRA-UNTAD',
      },
      {
        name: 'description',
        content:
          'Buat akun pelapor SIPRA-UNTAD untuk melaporkan kerusakan fasilitas kampus Universitas Tadulako secara terverifikasi.',
      },
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
  beforeLoad: async () => {
    const session = await getCurrentUserSession()
    if (session?.user) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <PublicNavbar subtitle="Pendaftaran Akun Pelapor" />

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 py-8 md:py-12">
        <RegisterForm />
      </main>

      <footer className="border-t-2 border-[#09090B] bg-[#FAF8F5] py-4 text-center text-xs font-mono text-[#52525B]">
        Universitas Tadulako • Sistem Pelaporan Infrastruktur Kampus • WITA (UTC+8)
      </footer>
    </div>
  )
}

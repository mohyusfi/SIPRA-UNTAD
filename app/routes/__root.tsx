import * as React from 'react'
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
  useRouterState,
} from '@tanstack/react-router'
import '../app.css'

const SITE_URL = 'https://sipenad.vercel.app'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'SIPENAD - Sistem Informasi Pelaporan Infrastruktur Untad',
      },
      {
        name: 'description',
        content:
          'SIPENAD: Sistem informasi pelaporan infrastruktur kampus Universitas Tadulako. Laporkan fasilitas rusak secara anonim, pantau status perbaikan real-time.',
      },
      {
        name: 'og:site_name',
        content: 'SIPENAD',
      },
      {
        name: 'og:title',
        content: 'SIPENAD - Sistem Informasi Pelaporan Infrastruktur Untad',
      },
      {
        name: 'og:description',
        content:
          'Sistem informasi pelaporan infrastruktur kampus Universitas Tadulako. Laporkan fasilitas rusak secara anonim, pantau status perbaikan real-time.',
      },
      {
        name: 'og:url',
        content: SITE_URL,
      },
      {
        name: 'og:type',
        content: 'website',
      },
      {
        name: 'og:locale',
        content: 'id_ID',
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
      {
        name: 'twitter:title',
        content: 'SIPENAD - Sistem Informasi Pelaporan Infrastruktur Untad',
      },
      {
        name: 'twitter:description',
        content:
          'Laporkan kerusakan infrastruktur kampus Universitas Tadulako secara anonim atau terverifikasi.',
      },
      {
        name: 'google-site-verification',
        content: 'A8xLPx0mZ-KKhzVfm8w_2v1utlLLL3TK06XGp7N1vj8'
      }
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'shortcut icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'canonical',
        href: SITE_URL,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap',
      },
    ],
  }),
  component: RootComponent,
})



function NavigationProgressBar() {
  const isNavigating = useRouterState({
    select: (state: { status?: string }) => state.status === 'pending',
  })

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-[#09090B]">
      <div className="h-full bg-[#D9F99D] animate-pulse w-full" />
    </div>
  )
}

function RootComponent() {
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasDid =
        document.cookie.includes('sipenad_did=') ||
        document.cookie.includes('sipantad_did=') ||
        document.cookie.includes('sipra_did=')
      if (!hasDid) {
        const did =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
        document.cookie = `sipenad_did=${did}; path=/; max-age=31536000; SameSite=Lax`
      }
    }
  }, [])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#DDD6FE] text-[#09090B] min-h-screen antialiased">
        <NavigationProgressBar />
        {children}
        <Scripts />
      </body>
    </html>
  )
}

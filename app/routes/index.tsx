import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { getMasterData } from '~/features/reports/reports.fn'
import { ReportForm } from '~/features/reports/components/report-form'
import { PublicNavbar } from '~/components/layout/public-navbar'
import { BottomNav } from '~/components/layout/bottom-nav'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      {
        title: 'Lapor Kerusakan Fasilitas Kampus UNTAD | SIPENAD',
      },
      {
        name: 'description',
        content:
          'Laporkan kerusakan infrastruktur kampus Universitas Tadulako secara anonim atau terverifikasi. Pantau status perbaikan real-time dengan kode tiket resmi.',
      },
      {
        name: 'og:title',
        content: 'Lapor Kerusakan Fasilitas Kampus UNTAD | SIPENAD',
      },
      {
        name: 'og:description',
        content:
          'Laporkan kerusakan infrastruktur kampus Universitas Tadulako secara anonim atau terverifikasi. Pantau status perbaikan real-time.',
      },
      {
        name: 'og:url',
        content: 'https://sipenad.vercel.app/',
      },
      {
        name: 'og:type',
        content: 'website',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://sipenad.vercel.app/',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'SIPENAD',
          alternateName: 'Sistem Informasi Pelaporan Infrastruktur Untad',
          url: 'https://sipenad.vercel.app/',
          applicationCategory: 'GovernmentApplication',
          operatingSystem: 'Web',
          description:
            'Sistem pelaporan kerusakan infrastruktur kampus Universitas Tadulako. Laporkan fasilitas rusak secara anonim, pantau status perbaikan real-time.',
          provider: {
            '@type': 'EducationalOrganization',
            name: 'Universitas Tadulako',
            alternateName: 'UNTAD',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Palu',
              addressRegion: 'Sulawesi Tengah',
              addressCountry: 'ID',
            },
          },
          inLanguage: 'id',
        }),
      },
    ],
  }),
  loader: async () => {
    return await getMasterData()
  },
  component: HomePage,
})

function HomePage() {
  const data = Route.useLoaderData()

  const scrollToForm = (e?: React.MouseEvent) => {
    e?.preventDefault()
    const el = document.getElementById('report-form-section')
    if (el) {
      try {
        const yOffset = -24
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      } catch {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#DDD6FE]">
      <PublicNavbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-8">
        {/* Hero Section */}
        <section className="w-full bg-[#FAF8F5] border-2 border-[#09090B] shadow-[6px_6px_0_0_#09090B] p-6 md:p-10 relative overflow-hidden">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block transform -rotate-2 bg-[#D9F99D] border-2 border-[#09090B] px-3 py-0.5 text-xs md:text-sm font-black text-[#09090B] shadow-[2px_2px_0_0_#09090B]">
                INFRASTRUKTUR KAMPUS
              </span>
              <span className="font-mono text-xs font-bold text-[#52525B]">
                BUMI TADULAKO TONDO
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[#09090B] tracking-tight leading-tight">
              Laporkan Kerusakan & Kawal Fasilitas Bersama.
            </h1>

            <p className="text-sm md:text-base text-[#52525B] mt-4 leading-relaxed font-medium">
              Sampaikan keluhan fasilitas fisik di lingkungan Universitas
              Tadulako secara terbuka maupun anonim. Dapatkan nomor tiket resmi
              dan pantau linimasa perbaikan teknisi hingga tuntas.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
              <button
                type="button"
                onClick={scrollToForm}
                className="px-6 py-3 font-bold uppercase tracking-wider text-xs md:text-sm bg-[#D9F99D] text-[#09090B] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] md:hover:translate-x-[2px] md:hover:translate-y-[2px] md:hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none"
              >
                <span>Buat Laporan Baru</span>
                <ArrowDown className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <Link
                to="/track"
                className="px-5 py-3 font-bold uppercase tracking-wider text-xs md:text-sm bg-white text-[#09090B] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:bg-neutral-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Cek Progres Tiket</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* Quick Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t-2 border-[#09090B]">
            <div className="border-2 border-[#09090B] bg-white p-3 shadow-[2px_2px_0_0_#09090B]">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-xs text-[#09090B]">
                  Pilihan Anonim
                </h3>
              </div>
              <p className="text-[11px] text-[#52525B]">
                Privasi terlindungi, kirim laporan tanpa perlu mencantumkan identitas.
              </p>
            </div>

            <div className="border-2 border-[#09090B] bg-white p-3 shadow-[2px_2px_0_0_#09090B]">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-xs text-[#09090B]">
                  Linimasa Real-time
                </h3>
              </div>
              <p className="text-[11px] text-[#52525B]">
                Pantau disposisi dari verifikasi admin sampai teknisi selesai kerja.
              </p>
            </div>

            <div className="border-2 border-[#09090B] bg-white p-3 shadow-[2px_2px_0_0_#09090B]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-xs text-[#09090B]">
                  Verifikasi Bukti
                </h3>
              </div>
              <p className="text-[11px] text-[#52525B]">
                Setiap laporan tuntas diverifikasi dengan foto fisik sebelum dan sesudah.
              </p>
            </div>
          </div>
        </section>

        {/* Form Pelaporan Section */}
        <section
          id="report-form-section"
          className="w-full bg-[#FAF8F5] border-2 border-[#09090B] shadow-[6px_6px_0_0_#09090B] p-6 md:p-10 scroll-mt-6"
        >
          <div className="border-b-2 border-[#09090B] pb-4 mb-6">
            <span className="inline-block transform -rotate-1 bg-[#FEF08A] border-2 border-[#09090B] px-2.5 py-0.5 text-xs font-black font-mono mb-2 shadow-[2px_2px_0_0_#09090B]">
              FORMULIR TERPADU
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#09090B]">
              Formulir Pelaporan Kerusakan Fisik
            </h2>
            <p className="text-xs md:text-sm text-[#52525B] mt-1 font-medium">
              Lengkapi rincian kerusakan fasilitas di bawah ini dengan akurat agar
              teknisi dapat segera menindaklanjuti.
            </p>
          </div>

          <ReportForm
            categories={data.categories}
            locations={data.locations}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF8F5] border-t-2 border-[#09090B] py-6 px-4 text-xs font-bold text-[#52525B] text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            SIPENAD • Sistem Informasi Pelaporan Infrastruktur Untad
          </span>
          <span className="font-mono text-[11px]">
            Biro Umum dan Keuangan (BUK) UNTAD
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

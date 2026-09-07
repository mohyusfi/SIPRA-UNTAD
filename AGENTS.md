# AGENTS.md

## Core Rules & Conventions

- **Bahasa**: Gunakan Bahasa Indonesia saat Plan Mode atau saat memberikan penjelasan.
- **Komentar Kode**: Jangan menambahkan komentar pada kode di Build Mode, kecuali untuk logika yang sangat krusial.
- **Git Safety**: Dilarang melakukan auto-commit, merge, push, atau create PR tanpa konfirmasi dan izin eksplisit dari pengguna.
- **Frontend Design**: Wajib jalankan skill `frontend-design` sebelum membuat atau merombak komponen visual/halaman UI.
- **Zero Raw Emojis**: Dilarang menggunakan raw emoji Unicode di UI atau kode. Gunakan pustaka resmi `lucide-react` dengan border box sesuai panduan `DESIGN.md`.

## Overview & Architecture

- **Framework**: TanStack Start (React 19, Vite, Nitro/Vercel).
- **Routing**: TanStack Router berbasis file di `app/routes/` (menghasilkan `app/routeTree.gen.ts`).
- **Data & State**: TanStack Query v5 dengan SSR hydration.
- **Styling**: Tailwind CSS v4 (konfigurasi token `@theme` di CSS, tema *Soft-Pop Neo-Brutalism*).
- **Database & ORM**: PostgreSQL (Supabase) + Drizzle ORM. Skema di `app/db/schema.ts`, instance di `app/db/index.ts`, migrasi di `drizzle/`.
- **Auth & Roles**: Better Auth dengan 4 role (`reporter`, `technician`, `admin`, `monitor`) serta pelaporan anonim dengan tracking code format `UNTAD-2026-XXXXXX`.
- **Rich Text Editor**: Tiptap (StarterKit) menyimpan JSON di kolom `description_json` dan teks biasa di `description_text`.
- **Object Storage**: Supabase Storage (Private bucket) dengan Signed URL (TTL 60 menit).

## Path Aliases

- Resolusi path alias utama mengarah ke `./app/*` (e.g. `~/components/*`, `@/db/*`, atau `#/features/*` sesuai konfigurasi `tsconfig.json`).

## Key Developer Commands

```bash
# Development server
npm run dev

# Generate TanStack route tree (wajib dijalankan sebelum typecheck/build jika dev server mati)
npm run generate-routes

# Build & Preview
npm run build
npm run preview

# Linting & Formatting
npm run lint
npm run check
npm run format

# Database (Drizzle Kit + PostgreSQL)
npm run db:generate    # Generate migrasi SQL
npm run db:push        # Push skema langsung ke DB
npm run db:migrate     # Jalankan migrasi
npm run db:seed        # Seeding akun & data master kampus awal
npm run db:studio      # Web viewer Drizzle Studio
```

## Recommended Verification Sequence

Saat memverifikasi perubahan kode, jalankan urutan berikut:

```bash
npm run generate-routes && npm run lint && npm run build
```

## Gotchas & Operational Notes

1. **Sync Route Tree**: Jika TypeScript melaporkan error terkait rute atau argumen path di `app/routes/`, jalankan `npm run generate-routes` (`tsr generate`).
2. **Neo-Brutalist Styling**: Ikuti spesifikasi `DESIGN.md`: border solid 2px `#09090B`, hard shadow `shadow-[4px_4px_0_0_#09090B]`, latar `canvas-surface` (`#FAF8F5`), aksen `brand-lime` (`#D9F99D`), dan `brand-lilac` (`#C4B5FD`). Hindari gradien blur atau rounded radius besar.
3. **Validasi Laporan Anonim**: Formulir anonim harus dilengkapi proteksi honeypot dan rate-limiting tanpa menyimpan raw IP pelapor.
4. **Alur Transisi Status (State Machine)**: Transisi status wajib diaudit ke tabel `report_timeline`. Status `Selesai`, `Ditolak`, dan `Duplikat` bersifat mutlak (*immutable*).
5. **Akses Foto**: Foto laporan di Supabase Storage bersifat privat; selalu fetch Signed URL melalui server function.

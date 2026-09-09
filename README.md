# SIPENAD (Sistem Informasi Pelaporan Infrastruktur Untad)

Sistem Informasi Pelaporan Infrastruktur Untad (SIPENAD) adalah platform berbasis web responsif yang dirancang untuk mengelola siklus pelaporan masalah dan penanganan kerusakan fasilitas fisik di lingkungan Universitas Tadulako (Bumi Tadulako Tondo, Palu). Sistem ini mengintegrasikan interaksi antara pelapor (sivitas akademika dan tamu), teknisi lapangan, administrator sarana-prasarana, serta pimpinan universitas secara transparan dan terstruktur.

---

## 1. Ringkasan Sistem

Aplikasi ini mendigitalkan proses penanganan sarana kampus yang sebelumnya bersifat manual. Alur operasional sistem bekerja sebagai berikut:
1. **Pelaporan**: Mahasiswa, dosen, atau staf mendokumentasikan kerusakan fasilitas (misalnya kelistrikan, sanitasi, atau kerusakan fisik gedung) melalui portal pelaporan publik, baik secara anonim maupun menggunakan akun terverifikasi.
2. **Disposisi & Verifikasi**: Tim sarana-prasarana (Admin) memvalidasi keabsahan laporan, menentukan skala prioritas, dan menugaskan teknisi terkait.
3. **Pengerjaan**: Teknisi menerima surat tugas digital pada dasbor pengerjaan, melaksanakan perbaikan, dan mengunggah foto bukti fisik hasil perbaikan.
4. **Validasi & Penutupan**: Admin memverifikasi bukti perbaikan sebelum menyatakan tiket selesai (*resolved*). Pimpinan universitas dapat memantau indikator kinerja perbaikan fasilitas melalui dasbor analitik.

---

## 2. Fitur Utama

- **Pelaporan Publik dan Anonim**: Dukungan pelaporan dengan atau tanpa login akun. Dilengkapi kode pelacak unik (*Tracking Code*) format `UNTAD-2026-XXXXXX`, proteksi bot berbasis *honeypot*, dan pembatasan frekuensi kirim (*rate-limiting*) berbasis hash IP per 15 menit.
- **Gerbang Autentikasi Terpisah (2-Tab Login)**:
  - *Portal Sivitas*: Autentikasi satu klik melalui Google OAuth 2.0 (*zero friction*, peran otomatis `reporter`) dan akun lokal.
  - *Portal Staf Operasional*: Autentikasi berbasis email dan kata sandi institusi untuk teknisi, administrator, dan pemantau guna mencegah eskalasi hak akses.
- **Kontrol Akses Berbasis Peran (RBAC)**:
  - `reporter` (Pelapor): Mengajukan laporan, membatalkan laporan berstatus *Diajukan*, dan meninjau riwayat laporan milik sendiri.
  - `technician` (Teknisi): Menerima penugasan perbaikan, memperbarui status kerja (*Dalam Perbaikan*), dan mengunggah dokumentasi bukti penanganan.
  - `admin` (Administrator Sarpras): Memverifikasi laporan, menolak/menandai duplikat, menugaskan teknisi, menyetujui penyelesaian, dan mengelola data master (kategori dan lokasi).
  - `monitor` (Pimpinan/Pemantau): Akses baca (*read-only*) terhadap dasbor statistik, sebaran geografis kerusakan, dan metrik waktu penanganan (*Turnaround Time*).
- **Mesin Status Laporan & Jejak Audit**: Alur status terdefinisi (*Diajukan* -> *Diverifikasi* -> *Ditugaskan* -> *Dalam Perbaikan* -> *Menunggu Konfirmasi Admin* -> *Selesai* / *Ditolak* / *Duplikat*). Setiap mutasi status dan intervensi tercatat secara permanen pada tabel `report_timeline`.
- **Manajemen Berkas Terproteksi**: Foto awal dan foto bukti pengerjaan disimpan dalam Supabase Storage privat dan hanya dapat diakses melalui *Signed URL* berbatas waktu (kedaluwarsa 60 menit).
- **Editor Teks Terstruktur**: Implementasi editor teks Tiptap dengan penyimpanan data dalam format JSON (`description_json`) dan teks murni (`description_text`) yang terbebas dari kerentanan XSS.
- **Antarmuka Soft-Pop Neo-Brutalism**: Desain visual konsisten dengan kontras tinggi, batas garis tegas (*solid 2px stroke* `#09090B`), bayangan presisi (*hard shadows* `shadow-[4px_4px_0_0_#09090B]`), dan ikonografi resmi Lucide React.

---

## 3. Tumpukan Teknologi (Tech Stack)

| Lapisan Arsitektur | Teknologi | Keterangan |
|---|---|---|
| **Framework Aplikasi** | React 19 + TanStack Start | Arsitektur SSR, Server Functions, dan integrasi Vite |
| **Routing** | TanStack Router | Type-safe routing berbasis hierarki berkas |
| **State & Cache** | TanStack Query v5 | Sinkronisasi status server dan invalidasi cache otomatis |
| **Styling** | Tailwind CSS v4 | Konfigurasi token desain pada modul CSS `@theme` |
| **Basis Data & ORM** | PostgreSQL (Supabase) + Drizzle ORM | Skema deklaratif berbasis TypeScript dan migrasi Drizzle Kit |
| **Autentikasi** | Better Auth | Session berbasis basis data dengan Google OAuth 2.0 |
| **Object Storage** | Supabase Storage | Bucket privat untuk aset multimedia laporan |
| **Validasi Skema** | Zod | Validasi end-to-end pada formulir dan server function |
| **Ikonografi** | Lucide React | Pustaka ikon standar tanpa simbol raw emoji |

---

## 4. Panduan Memulai Cepat (Quick Start)

### 4.1 Prasyarat Sistem
- Node.js versi 20.x atau LTS terbaru
- Pengelola paket `npm` atau `pnpm`
- Instance PostgreSQL / Proyek Supabase aktif

### 4.2 Instalasi Repositori
```bash
git clone https://github.com/username/sipenad.git
cd sipenad
npm install
```

### 4.3 Konfigurasi Variabel Lingkungan
Duplikasi berkas konfigurasi template:
```bash
cp .env.example .env
```

Lengkapi parameter pada berkas `.env`:
```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=masukkan-secret-acak-minimal-32-karakter

# Google Cloud Console (OAuth 2.0 Client ID)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Supabase Credentials
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

### 4.4 Inisialisasi Basis Data
Terapkan skema tabel ke PostgreSQL dan muat data master kampus:
```bash
# Menerapkan skema Drizzle ke basis data
npm run db:push

# Mengisi data master kategori dan lokasi awal UNTAD
npm run db:seed
```

### 4.5 Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi berjalan secara lokal pada alamat `http://localhost:3000`.

---

## 5. Kredensial Akun Uji Coba (Demo Accounts)

Tabel berikut memuat kredensial akun awal yang disiapkan untuk pengujian alur kerja tiap peran:

| Peran | Email | Kata Sandi | Metode Masuk |
|---|---|---|---|
| **Pelapor (Sivitas)** | `pelapor@untad.ac.id` | `Password123!` | Tab Sivitas / Tombol Google |
| **Teknisi Lapangan** | `teknisi@untad.ac.id` | `Password123!` | Tab Petugas & Admin |
| **Admin Sarpras** | `admin@untad.ac.id` | `Password123!` | Tab Petugas & Admin |
| **Pemantau / Pimpinan** | `pemantau@untad.ac.id` | `Password123!` | Tab Petugas & Admin |

---

## 6. Referensi Perintah Pengembang (CLI Commands)

```bash
# Menjalankan server pengembangan Vite
npm run dev

# Memperbarui pohon rute TanStack Router
npm run generate-routes

# Pengecekan tipe statis TypeScript
npm run check

# Pemeriksaan kualitas kode dengan ESLint
npm run lint

# Pemformatan berkas dengan Prettier
npm run format

# Kompilasi build aplikasi untuk lingkungan produksi
npm run build

# Menjalankan pratinjau hasil build secara lokal
npm run preview

# Manajemen Skema Basis Data (Drizzle Kit)
npm run db:push      # Mendorong perubahan skema langsung ke basis data
npm run db:generate  # Membuat berkas migrasi SQL baru
npm run db:migrate   # Menjalankan migrasi SQL pada basis data target
npm run db:seed      # Memuat data master kategori dan gedung
npm run db:studio    # Membuka antarmuka grafis Drizzle Studio
```

---

## 7. Struktur Direktori Proyek

```
sipenad/
├── app/
│   ├── routes/              # Rute berbasis berkas TanStack Router
│   │   ├── api/             # Endpoint API dan handler Better Auth
│   │   ├── __root.tsx       # Root layout dan provider aplikasi
│   │   └── index.tsx        # Halaman muka dan portal pelaporan
│   ├── features/            # Modul logika bisnis aplikasi
│   │   ├── reports/         # Formulir pelaporan dan tampilan pelacakan
│   │   ├── admin/           # Disposisi teknisi dan jejak audit
│   │   ├── technician/      # Formulir kerja lapangan dan unggah bukti
│   │   └── analytics/       # Metrik ringkasan dan visualisasi data
│   ├── components/          # Komponen antarmuka pengguna umum
│   ├── db/
│   │   ├── schema.ts        # Definisi tabel PostgreSQL dan relasi Drizzle
│   │   ├── index.ts         # Inisialisasi klien PostgreSQL Drizzle
│   │   └── seed.ts          # Skrip muat data master awal
│   ├── lib/
│   │   ├── auth.ts          # Konfigurasi server Better Auth
│   │   ├── auth-client.ts   # Klien frontend Better Auth
│   │   ├── supabase.ts      # Klien Supabase Storage
│   │   └── utils.ts         # Utilitas umum dan generator tracking code
│   ├── app.css              # Konfigurasi Tailwind CSS v4
│   └── router.tsx           # Konfigurasi TanStack Router
├── drizzle/                 # Berkas riwayat migrasi SQL
├── PRD.md                   # Spesifikasi kebutuhan produk lengkap
├── DESIGN.md                # Spesifikasi pedoman desain antarmuka
├── AGENTS.md                # Panduan konvensi agen dan pengembangan
├── package.json             # Manifes dependensi dan skrip proyek
└── vite.config.ts           # Konfigurasi bundler Vite
```

---

## 8. Lisensi & Hak Cipta

Proyek ini dikembangkan sebagai bagian dari sistem pengelolaan sarana kampus Universitas Tadulako (UNTAD).

# Product Requirements Document (PRD)
## Sistem Informasi Pelaporan Infrastruktur Untad (SIPANTAD)

---

### 1. Ringkasan Eksekutif & Latar Belakang

Sistem Informasi Pelaporan Infrastruktur Untad (SIPANTAD) adalah platform berbasis web responsif yang dirancang untuk mengelola seluruh siklus pelaporan masalah dan kerusakan fasilitas fisik di lingkungan Universitas Tadulako (UNTAD). Sistem ini menjembatani sivitas akademika (mahasiswa, dosen, tendik, tamu), petugas teknisi lapangan, administrator sarana-prasarana, serta pimpinan universitas untuk pemantauan kualitas layanan.

- **Tipe Aplikasi**: Web Application (Mobile-responsive)
- **Tingkat Kesiapan**: Minimum Viable Product (MVP) berstandar Best Practice
- **Cakupan Wilayah**: 1 Universitas (Kampus Bumi Tadulako Tondo, Palu)
- **Bahasa & Zona Waktu**: Bahasa Indonesia / WITA (Asia/Makassar, UTC+8)

---

### 2. Sasaran & Batasan Proyek

#### 2.1 Sasaran Utama
1. Mempermudah pelaporan kerusakan sarana kampus secara terbuka, baik dengan akun maupun secara anonim.
2. Menyediakan autentikasi cepat dan tanpa friksi (*zero friction*) melalui **Login via Google (Google OAuth 2.0)** khusus untuk sivitas/pelapor, di samping pendaftaran akun lokal.
3. Memberikan alur kerja penanganan laporan yang terstruktur, transparan, dan dapat diaudit dari awal hingga selesai.
4. Menyediakan visibilitas status perbaikan bagi pelapor serta pemantau eksekutif (dashboard statistik real-time).

#### 2.2 Batasan (Out of Scope untuk MVP)
1. Tidak ada integrasi SSO institusi on-premise (LDAP/SIAKAD); Google OAuth 2.0 didukung sebagai Social Sign-On utama sivitas akademika.
2. Tidak ada manajemen inventaris aset mendalam, depresiasi, dan anggaran perbaikan.
3. Tidak ada penugasan multi-teknisi per laporan (cukup 1 teknisi penanggung jawab utama).
4. Tidak ada pengiriman notifikasi pihak ketiga berbayar (WhatsApp Gateway / SMS); notifikasi berfokus pada in-app dashboard & email lokal.
5. Pemilihan koordinat titik peta interaktif ditunda; digantikan oleh hierarki lokasi terstruktur dan catatan area terbuka.

---

### 3. Arsitektur & Tumpukan Teknologi

| Komponen | Teknologi Terpilih | Alasan & Justifikasi |
|---|---|---|
| **Framework Full-stack** | React 19 + TanStack Start | Server Functions, SSR, type-safe routing, optimal untuk aplikasi performa tinggi |
| **State & Data Fetching** | TanStack Query v5 | Cache invalidation, query synchronization, dan optimistic updates |
| **Styling** | Tailwind CSS v4 | Utilitas cepat, desain responsif, konsisten, dan mudah dipelihara |
| **Rich Text Editor** | Tiptap (StarterKit) | Output JSON aman, pembatasan format teks, character counter, mencegah XSS |
| **Validasi Skema** | Zod | Validasi end-to-end (klien, server function, dan payload database) |
| **Autentikasi & RBAC** | Better Auth (Email/Password + Google OAuth 2.0) | Session berbasis PostgreSQL, dukungan role bawaan, keamanan credential standar industri, one-click sign-in untuk pelapor |
| **Database & ORM** | PostgreSQL (Supabase) + Drizzle ORM & Drizzle Kit | Migrasi type-safe, query builder SQL-like ringan, skema deklaratif |
| **Object Storage** | Supabase Storage (Private Bucket) | Penyimpanan foto laporan dan bukti perbaikan dengan Signed URL |
| **Deployment Target** | Vercel (Front/API) & Supabase Cloud (DB/Storage) | Zero-config deployment, gratis untuk demo tugas, performa tinggi |

---

### 4. Peran Pengguna & Matriks Hak Akses (RBAC)

Sistem memiliki 4 peran pengguna yang tersimpan dalam tabel identitas:

| Fitur / Tindakan | Publik / Anonim | Pelapor (Akun) | Teknisi | Admin | Pemantau |
|---|:---:|:---:|:---:|:---:|:---:|
| Buat Laporan Baru | ✅ (Kode Lacak) | ✅ | ❌ | ✅ | ❌ |
| Lacak Status via Kode Lacak | ✅ | ✅ | ❌ | ✅ | ❌ |
| Lihat Daftar Laporan Milik Sendiri | ❌ | ✅ | ❌ | ✅ | ❌ |
| Edit/Batal Laporan (Status `Diajukan`) | ❌ | ✅ | ❌ | ✅ | ❌ |
| Verifikasi / Tolak / Tandai Duplikat | ❌ | ❌ | ❌ | ✅ | ❌ |
| Tugaskan Teknisi ke Laporan | ❌ | ❌ | ❌ | ✅ | ❌ |
| Mulai Pengerjaan Laporan | ❌ | ❌ | ✅ (Hanya miliknya) | ✅ | ❌ |
| Unggah Bukti & Ajukan Selesai | ❌ | ❌ | ✅ (Hanya miliknya) | ✅ | ❌ |
| Konfirmasi Final / Selesai / Kembalikan | ❌ | ❌ | ❌ | ✅ | ❌ |
| Kelola Kategori & Lokasi Master | ❌ | ❌ | ❌ | ✅ | ❌ |
| Kelola Akun & Penugasan Role | ❌ | ❌ | ❌ | ✅ | ❌ |
| Lihat Audit Log & Timeline Lengkap | ❌ | ❌ | ❌ | ✅ | ❌ |
| Akses Dashboard Metrik & Statistik | ❌ | ❌ | ❌ | ✅ | ✅ (Read-only) |

#### 4.1 Kebijakan Autentikasi & Penetapan Peran:
1. **Khusus Peran Pelapor (`reporter`)**:
   - Login via Google (Google OAuth 2.0) hanya diperuntukkan bagi peran **Pelapor (Sivitas & Tamu Kampus)**.
   - Pendaftaran pertama kali melalui Google secara otomatis menetapkan peran `reporter` (*zero friction*, tanpa formulir tambahan).
   - Layanan terbuka untuk seluruh akun Google personal (`@gmail.com`) maupun akun institusi (`@untad.ac.id`).
2. **Isolasi Akun Petugas & Staf Internal**:
   - Pengguna dengan peran **Teknisi**, **Admin Sarpras**, dan **Pemantau** diwajibkan masuk melalui kredensial Email & Password institusi.
   - Jika pengguna staf mencoba masuk via tombol Google dengan email yang berelasi dengan akun staf, sistem secara otomatis menolak autentikasi dan menampilkan pesan: *"Akun staf/petugas wajib masuk menggunakan kata sandi pada tab Petugas"*. Hal ini menjaga perimeter keamanan dashboard operasional kampus.

---

### 5. Alur Status Laporan (State Machine)

Laporan infrastruktur mengikuti transisi status strictly-defined berikut:

```
[ Pelapor Membuat Laporan ]
            │
            ▼
       [ Diajukan ]
            │
            ├───(Admin: Tolak dengan Alasan)─────────────► [ Ditolak ]
            ├───(Admin: Tandai Duplikat + Link Induk)────► [ Duplikat ]
            │
            ▼ (Admin: Verifikasi & Tentukan Prioritas)
     [ Diverifikasi ]
            │
            ▼ (Admin: Pilih Teknisi)
      [ Ditugaskan ]
            │
            ▼ (Teknisi: Klik 'Mulai Pengerjaan')
    [ Dalam Perbaikan ]
            │
            ▼ (Teknisi: Upload Foto Bukti + Catatan Perbaikan)
[ Menunggu Konfirmasi Admin ]
            │
            ├───(Admin: Perbaikan Belum Tuntas)──────────► [ Dalam Perbaikan ]
            │
            ▼ (Admin: Konfirmasi Bukti Valid)
        [ Selesai ]
```

#### Aturan Transisi:
1. **Laporan Anonim**: Diberikan tracking code acak `UNTAD-[YEAR]-[6-CHAR-ALPHANUMERIC]` (contoh: `UNTAD-2026-X8K2M1`).
2. **Mandatory Notes**: Admin wajib menyertakan catatan tertulis pada aksi penolakan, duplikasi, dan pengembalian perbaikan.
3. **Immutability**: Laporan yang sudah masuk status `Selesai`, `Ditolak`, atau `Duplikat` tidak dapat diubah statusnya lagi. Masalah berulang ditangani dengan membuat laporan baru.

---

### 6. Spesifikasi Fitur Fungsional

#### 6.0 Modul Autentikasi & Akses Gerbang Masuk (/login)
- **Antarmuka 2-Tab Terpisah (Soft-Pop Neo-Brutalism)**:
  - **Tab 1: Sivitas / Pelapor**:
    - Tombol *Masuk dengan Google* (*Zero Friction*, auto-assign role `reporter`).
    - Menggunakan border solid 2px hitam pekat (`#09090B`), hard shadow `4px 4px 0px 0px #09090B`, dan logo Google resmi (tanpa raw emoji).
    - Pemisah visual: "atau masuk dengan akun lokal".
    - Form Email & Kata Sandi lokal beserta tautan ke halaman pendaftaran `/register`.
  - **Tab 2: Petugas & Admin**:
    - Form Email & Kata Sandi institusi untuk Teknisi, Admin Sarpras, dan Pemantau.
    - Tanpa tombol Google OAuth untuk mencegah kerentanan salah masuk atau akses ke level manajemen dari perangkat publik.
- **Proteksi Konflik & Eskalasi Hak Akses**:
  - Validasi callback OAuth: Jika email yang diterima dari penyedia Google cocok dengan akun yang berstatus staf internal (`technician`, `admin`, `monitor`), sesi OAuth langsung digagalkan dan menampilkan pesan informatif bahwa akun staf wajib login menggunakan kata sandi pada Tab Petugas.
- **Onboarding Akun Baru**:
  - Akun yang pertama kali mendaftar via Google langsung diarahkan ke dasbor pelapor atau formulir pembuatan laporan tanpa langkah verifikasi manual tambahan.

#### 6.1 Modul Pelaporan (Public & Pelapor)
- **Formulir Laporan**:
  - Judul laporan: Teks singkat (5–120 karakter).
  - Deskripsi Tiptap: Rich-text (Bold, Italic, Bullet List, Numbered List) dengan batasan panjang bersih 20–2.000 karakter. Disimpan dalam format JSON.
  - Kategori: Dropdown kategori aktif yang dikelola admin.
  - Lokasi: Hierarki (Kampus -> Gedung/Area -> Lantai -> Ruangan/Detail Lokasi).
  - Urgensi Awal: Pilihan `Normal`, `Tinggi`, `Darurat`.
  - Foto Awal: Minimal 1 foto, maksimal 5 foto (JPEG/PNG/WebP, maks 5MB per file). Diunggah ke Supabase Storage privat.
  - Opsi Anonim: Checkbox. Jika dicentang, nama/email tidak disimpan dalam relasi pelapor. Jika tidak dicentang, wajib menyertakan nama dan email valid.
- **Pelacakan Laporan**:
  - Halaman publik `/track` menerima kode pelacakan.
  - Menampilkan ringkasan status, timeline kemajuan, dan foto perbaikan (jika sudah selesai) tanpa membocorkan identitas pelapor.

#### 6.2 Modul Manajemen Laporan & Disposisi (Admin)
- **Verifikasi Laporan Masuk**:
  - Pemeriksaan kelayakan laporan, penyesuaian kategori/urgensi akhir.
  - Opsi: `Setujui`, `Tolak` (wajib alasan), atau `Duplikat` (pilih ID laporan rujukan).
- **Penugasan Teknisi**:
  - Dropdown daftar teknisi yang tersedia. Penugasan langsung mencatat audit log dan merubah status ke `Ditugaskan`.
- **Review Penyelesaian**:
  - Tampilan perbandingan foto sebelum (initial report) dan foto sesudah (technician completion proof).
  - Tombol persetujuan penyelesaian (`Tutup Selesai`) atau penolakan bukti (`Kembalikan ke Teknisi`).

#### 6.3 Modul Kerja Lapangan (Teknisi)
- Halaman antarmuka khusus mobile/desktop untuk teknisi.
- Daftar pekerjaan: tab `Tugas Baru`, `Sedang Dikerjakan`, dan `Riwayat Selesai`.
- Aksi tombol: `Mulai Kerjakan` -> merubah status menjadi `Dalam Perbaikan`.
- Form Penyelesaian:
  - Unggah minimal 1 foto bukti fisik setelah perbaikan.
  - Catatan tindakan perbaikan yang dilakukan (teks biasa).
  - Submit ke admin.

#### 6.4 Modul Monitoring & Dashboard (Pemantau & Eksekutif)
- Tampilan analitik read-only:
  - Kartu ringkasan: Total Laporan, Laporan Selesai, Sedang Diproses, Laporan Darurat.
  - Grafik distribusi laporan berdasarkan Kategori Infrastruktur.
  - Grafik sebaran laporan berdasarkan Gedung/Fakultas.
  - Rata-rata waktu penyelesaian (Turnaround Time / SLA).
  - Filter rentang tanggal (7 hari terakhir, 30 hari terakhir, semester berjalan).

#### 6.5 Modul Pengaturan Master Data (Admin)
- **Kategori**: Tambah nama kategori baru (validasi unik case-insensitive), edit, dan arsipkan (soft delete).
- **Lokasi**: Manajemen hierarki Gedung, Lantai, dan Ruangan.
- **Pengguna**: Daftar pengguna terdaftar, pengubahan peran (Pelapor -> Teknisi/Admin/Pemantau).

---

### 7. Skema Basis Data Relasional (ERD)

```
┌──────────────────────┐         ┌─────────────────┐       ┌─────────────────┐       ┌──────────────────────┐
│       account        │         │      user       │       │    categories   │       │      locations       │
├──────────────────────┤         ├─────────────────┤       ├─────────────────┤       ├──────────────────────┤
│ id (PK)              │  N:1    │ id (PK)         │       │ id (PK)         │       │ id (PK)              │
│ user_id (FK -> user) ├────────►│ name            │       │ name (UNIQUE)   │       │ campus               │
│ account_id           │         │ email (UNIQUE)  │       │ is_archived     │       │ building             │
│ provider_id ('google'│         │ email_verified  │       │ created_at      │       │ floor                │
│ access_token         │         │ image           │       └────────┬────────┘       │ room_or_area         │
│ refresh_token        │         │ role            │                │                │ is_archived          │
│ id_token             │         │ created_at      │                │                └──────────┬───────────┘
│ password (NULLable)  │         │ updated_at      │                │ 1:N                       │ 1:N
└──────────────────────┘         └────────┬────────┘                │                           │
                                          │ 1:N                     │                           │
                                          ▼                         ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                 reports                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ id (PK, UUID)                                                                                            │
│ tracking_code (UNIQUE, VARCHAR)                                                                          │
│ title (VARCHAR)                                                                                          │
│ description_json (JSONB)                                                                                 │
│ description_text (TEXT)                                                                                  │
│ category_id (FK -> categories.id)                                                                        │
│ location_id (FK -> locations.id)                                                                         │
│ location_detail (TEXT)                                                                                   │
│ urgency (ENUM: 'normal', 'high', 'emergency')                                                            │
│ status (ENUM: 'submitted', 'verified', 'assigned', 'in_progress', ...)                                   │
│ is_anonymous (BOOLEAN)                                                                                   │
│ reporter_id (FK -> user.id, NULLABLE)                                                                    │
│ reporter_name (VARCHAR, NULLABLE)                                                                        │
│ reporter_email (VARCHAR, NULLABLE)                                                                       │
│ assigned_technician_id (FK -> user.id, NULLABLE)                                                         │
│ duplicate_of_id (FK -> reports.id, NULLABLE)                                                             │
│ created_at (TIMESTAMP WITH TZ)                                                                           │
│ updated_at (TIMESTAMP WITH TZ)                                                                           │
└────────┬─────────────────────────────────────────────────────────────────────────────────┬───────────────┘
         │ 1:N                                                                             │ 1:N
         ▼                                                                                 ▼
┌──────────────────────────────────┐                              ┌────────────────────────────────┐
│          report_photos           │                              │        report_timeline         │
├──────────────────────────────────┤                              ├────────────────────────────────┤
│ id (PK, UUID)                    │                              │ id (PK, UUID)                  │
│ report_id (FK -> reports.id)     │                              │ report_id (FK -> reports.id)   │
│ file_key (VARCHAR)               │                              │ actor_id (FK -> user.id, NULL) │
│ photo_type ('initial', 'proof')  │                              │ action (VARCHAR)               │
│ uploaded_by (FK -> user.id, NULL)│                              │ from_status (VARCHAR, NULL)    │
│ created_at (TIMESTAMP WITH TZ)   │                              │ to_status (VARCHAR)            │
└──────────────────────────────────┘                              │ notes (TEXT, NULLABLE)         │
                                                                  │ created_at (TIMESTAMP WITH TZ) │
                                                                  └────────────────────────────────┘
```

---

### 8. Keamanan, Integritas Data & Anti-Spam

1. **Anti-Spam Laporan Anonim**:
   - Honeypot hidden input field (mendeteksi bot form submitter).
   - In-memory rate limiting pada server: Maksimal 3 laporan anonim per 15 menit per hash alamat IP client.
   - Tidak menyimpan plain IP address di database untuk menjaga privasi pelapor.
2. **Proteksi Akses Gambar**:
   - Bucket Supabase Storage dibuat `private`.
   - Gambar hanya dapat diakses melalui Signed URL sementara (TTL 60 menit) yang di-generate oleh server function terautentikasi.
3. **Privasi Portal Publik**:
   - Endpoint daftar laporan publik (`/api/public/reports`) memfilter kolom sensitif: tidak menyertakan nama pelapor, email, deskripsi lengkap, maupun detail lokasi ruangan pribadi.
4. **Audit Trail**:
   - Seluruh mutasi status dan intervensi admin/teknisi dicatat ke tabel `report_timeline` dengan status asal, status tujuan, pelaku, catatan, dan timestamp.
5. **Keamanan & Integritas Google OAuth 2.0**:
   - Parameter `state` dan verifikasi nonce/PKCE wajib aktif untuk mencegah serangan *Cross-Site Request Forgery* (CSRF).
   - *Strict Whitelist Redirect Callback*: Hanya menerima callback resmi (`/api/auth/callback/google`) yang telah terdaftar di konsol Google Cloud.
   - *Privilege Escalation Prevention*: Sesi dari login Google dikunci hanya dapat mengakses hak peran `reporter`. Upaya login akun staf via Google ditolak secara tegas di level server callback Better Auth.
   - Rahasia klien (`GOOGLE_CLIENT_SECRET`) dijaga ketat di environment server, tidak pernah terekspos ke klien.

---

### 9. Rencana Data Awal (Seed Data) & Skenario Demo

#### 9.1 Akun Uji Coba Siap Pakai (Pre-seeded Users)
- **Pelapor (Kredensial Lokal)**: `pelapor@untad.ac.id` / `Password123!`
- **Pelapor (Social OAuth)**: Menggunakan akun Google pengguna pribadi (`@gmail.com`) atau institusi (`@untad.ac.id`) melalui tombol *Masuk dengan Google*.
- **Teknisi (Khusus Kredensial)**: `teknisi@untad.ac.id` / `Password123!`
- **Admin Sarpras (Khusus Kredensial)**: `admin@untad.ac.id` / `Password123!`
- **Pemantau / Pimpinan (Khusus Kredensial)**: `pemantau@untad.ac.id` / `Password123!`

#### 9.2 Kategori Awal Universitas Tadulako
1. `Gedung & Konstruksi` (pintu rusak, plafon bocor, retak dinding, kaca pecah)
2. `Kelistrikan & Penerangan` (lampu mati, korsleting, stop kontak rusak, AC mati)
3. `Sanitasi & Air Bersih` (pipa bocor, toilet tersumbat, kran air patah, tandon kosong)
4. `Jaringan & Fasilitas TI` (kabel LAN terputus, akses poin WiFi mati, proyektor kelas)
5. `Jalan, Parkir & Area Terbuka` (jalan berlubang, lampu taman, paving amblas)
6. `Kebersihan & Pertamanan` (sampah menumpuk, pohon tumbang, saluran drainase mampet)

#### 9.3 Master Lokasi Awal (Kampus Bumi Tadulako Tondo)
- Gedung Rektorat UNTAD
- Gedung Kuliah Bersama (GKB)
- Fakultas Teknik (Gedung Jurusan Informatika, Sipil, Elektro, Arsitektur)
- Fakultas MIPA
- Fakultas Kedokteran
- Perpustakaan Pusat UNTAD
- Auditorium & Lapangan Upacara

---

### 10. Struktur Folder Proyek (Modular & Feature-based)

```
sipantad/
├── PRD.md
├── .env.example
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx                    # Landing & form pelaporan
│   │   ├── track.tsx                    # Cek status kode pelacakan
│   │   ├── login.tsx                    # Login sivitas
│   │   ├── register.tsx                 # Registrasi akun pelapor
│   │   ├── dashboard/
│   │   │   ├── index.tsx                # Redirector berdasarkan role
│   │   │   ├── reporter/                # Riwayat laporan pelapor
│   │   │   ├── technician/              # Task list teknisi
│   │   │   ├── admin/                   # Verifikasi & master data admin
│   │   │   └── monitor/                 # Dashboard statistik pemantau
│   │   └── api/
│   │       └── auth/$.ts                # Better Auth handler
│   ├── features/
│   │   ├── reports/                     # Tiptap editor, form, tracking view
│   │   ├── admin/                       # Disposisi, audit trail, dialog status
│   │   ├── technician/                  # Upload bukti perbaikan, action cards
│   │   └── analytics/                   # Charts & summary stats
│   ├── components/                      # Reusable UI (buttons, badge, dialog, modal)
│   ├── db/
│   │   ├── index.ts                     # Drizzle client
│   │   ├── schema.ts                    # PostgreSQL schema definitions
│   │   └── seed.ts                      # Script seeding data awal
│   └── lib/
│       ├── auth.ts                      # Better Auth server configuration
│       ├── supabase.ts                  # Supabase Storage client
│       └── utils.ts                     # Helper format tanggal, tracking code
├── drizzle/                             # Migrations folder
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

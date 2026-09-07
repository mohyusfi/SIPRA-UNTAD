# Design System & UI/UX Specification: SIPRA-UNTAD
**Sistem Pelaporan Infrastruktur Kampus Universitas Tadulako**
*Visual Direction: Soft-Pop Neo-Brutalism (Ref: Image Reference 1 & PRD.md)*

---

## 1. Visi & Filosofi Desain

Mengadopsi estetika **Soft-Pop Neo-Brutalism** terinspirasi langsung dari referensi visual (Image 1) yang dipadukan dengan konteks operasional kampus Universitas Tadulako (Bumi Tadulako Tondo).

### Pilar Karakteristik Visual
1. **High Definition Structure**: Garis luar tegas (*solid 2px stroke*) berwarna hitam pekat (`#09090B`) pada setiap kartu, tombol, wadah input, dan panel navigasi.
2. **Hard Surface Shadows**: Bayangan tanpa blur (*hard drop shadow* `4px 4px 0px 0px #09090B`) yang memberikan sensasi taktikal, terpercaya, dan nyata seperti dokumen fisik/tiket resmi.
3. **Soft Lavender & Warm Paper Canvas**: Latar belakang aplikasi bernuansa ungu lembut (*soft lavender/lilac*) dikombinasikan dengan permukaan konten berwarna krem hangat (*warm off-white/canvas*), menghindarkan kesan intimidatif dari aplikasi pelaporan birokrasi tradisional.
4. **Neon Lime Accent & Tilted Highlighter**: Penggunaan aksen warna hijau limau (*acid/neon lime*) dengan rotasi miring unik (`-2deg`) sebagai penanda kata kunci, status penting, atau elemen interaktif utama.
5. **Two-Tier Retro Bar**: Struktur header bertingkat; bar utilitas atas untuk link cepat dan bar utama dengan wadah logo terbingkai box border mandiri.
6. **Minimalist Black & White Line-Art**: Ilustrasi berbasis guratan garis hitam bersih (*hand-drawn ink style*) merepresentasikan sivitas akademika, fasilitas gedung, dan perangkat teknisi tanpa shading gradien yang berat.

---

## 2. Design Tokens (Tailwind CSS v4 Configuration)

### 2.1 Palet Warna (Color Tokens)

```css
@theme {
  /* Canvas & Base Surfaces */
  --color-canvas-purple: #DDD6FE;        /* Latar belakang utama luar / body page (Purple-200) */
  --color-canvas-surface: #FAF8F5;       /* Latar panel kartu / form / modal (Warm Off-White) */
  --color-canvas-pure: #FFFFFF;          /* Background input dan elemen kontras tinggi */
  
  /* Ink & Borders */
  --color-ink-primary: #09090B;          /* Teks utama, icon, border solid (Zinc-950) */
  --color-ink-muted: #52525B;            /* Teks sekunder, label pembantu (Zinc-600) */
  --color-ink-faint: #A1A1AA;            /* Placeholder, disabled state (Zinc-400) */

  /* Brand Accents */
  --color-brand-lilac: #C4B5FD;          /* Tombol primer, tab aktif (Purple-300) */
  --color-brand-lilac-hover: #A78BFA;    /* Hover state tombol primer (Purple-400) */
  --color-brand-lime: #D9F99D;           /* Highlighter box, badge sukses/selesai (Lime-300) */
  --color-brand-lime-accent: #BEF264;    /* Accent punchy lime (Lime-400) */

  /* Status Machine Badges (PRD State Machine) */
  --color-status-submitted: #FEF08A;     /* Diajukan (Yellow-200) */
  --color-status-verified: #A5F3FC;      /* Diverifikasi (Cyan-200) */
  --color-status-assigned: #BAE6FD;      /* Ditugaskan (Sky-200) */
  --color-status-in-progress: #FED7AA;  /* Dalam Perbaikan (Orange-200) */
  --color-status-review: #E9D5FF;        /* Menunggu Konfirmasi (Purple-200) */
  --color-status-completed: #D9F99D;     /* Selesai (Lime-300) */
  --color-status-rejected: #FECDD3;      /* Ditolak (Rose-200) */
  --color-status-duplicate: #E2E8F0;     /* Duplikat (Slate-200) */

  /* Urgency Tokens */
  --color-urgency-normal: #E0E7FF;       /* Normal (Indigo-100) */
  --color-urgency-high: #FDE68A;         /* Tinggi (Amber-200) */
  --color-urgency-emergency: #FCA5A5;    /* Darurat (Red-300) */
}
```

### 2.2 Border, Shadow, & Radius Tokens

```css
@theme {
  /* Borders */
  --border-width-neo: 2px;
  --border-width-neo-thick: 3px;

  /* Shadows (Neo-Brutalism Hard Shadow) */
  --shadow-neo-sm: 2px 2px 0px 0px #09090B;
  --shadow-neo: 4px 4px 0px 0px #09090B;
  --shadow-neo-lg: 6px 6px 0px 0px #09090B;
  --shadow-neo-xl: 8px 8px 0px 0px #09090B;
  --shadow-neo-inset: inset 2px 2px 0px 0px #09090B;

  /* Border Radii */
  --radius-neo: 0px;                     /* Strictly sharp or ultra-minimal */
  --radius-neo-subtle: 2px;              /* Subtle tactile corner */
}
```

### 2.3 Tipografi & Skala Teks

| Role | Font Family | Weight | Tracking | Kasus Penggunaan |
|---|---|---|---|---|
| **Display / Heading** | `Space Grotesk`, `Plus Jakarta Sans`, sans-serif | Bold (700), ExtraBold (800) | `-0.02em` | Hero Title, Modal Heading, Section Titles |
| **Body Text** | `Plus Jakarta Sans`, `Inter`, sans-serif | Regular (400), Medium (500) | `normal` | Deskripsi laporan, isi teks, instruksi |
| **Monospace / Ticket** | `JetBrains Mono`, `Courier Prime`, monospace | SemiBold (600) | `0.05em` | Kode Lacak (`UNTAD-2026-XXXXXX`), Timestamp, JSON view |
| **Highlighter Label** | `Space Grotesk`, sans-serif | Bold (700) | `normal` | Tag penekan berputar (`-rotate-2`) |

---

## 3. Komponen UI Inti (Atomic Components)

### 3.1 Tombol (Buttons)

```tsx
// Primary Action Button (Ref: EXPLORE dengan Lucide ArrowUpRight)
<button className="px-5 py-2.5 font-bold uppercase tracking-wider text-xs md:text-sm bg-[#C4B5FD] text-[#09090B] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#09090B] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer">
  <span>Lapor Kerusakan</span>
  <ArrowUpRight className="w-4 h-4" />
</button>

// Secondary / Neutral Action (Lacak Tiket dengan Lucide Search)
<button className="px-4 py-2 font-bold text-xs md:text-sm bg-white text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-neutral-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center gap-2">
  <Search className="w-4 h-4" />
  <span>Lacak Tiket</span>
</button>

// Danger Action (Tolak Laporan dengan Lucide XCircle)
<button className="px-4 py-2 font-bold text-xs md:text-sm bg-[#FECDD3] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-[#FDA4AF] transition-all flex items-center gap-2">
  <XCircle className="w-4 h-4" />
  <span>Tolak Laporan</span>
</button>
```

### 3.2 Highlighter Badge (Signature Element Ref 1)

Elemen khas dari gambar referensi berupa teks berbingkai hitam solid dengan background warna cerah dan kemiringan dinamis:

```html
<!-- Tilted Highlighter Badge -->
<span class="inline-block transform -rotate-2 bg-[#D9F99D] border-2 border-[#09090B] px-3 py-0.5 text-xs md:text-sm font-black text-[#09090B] shadow-[2px_2px_0_0_#09090B]">
  infrastruktur kampus
</span>
```

### 3.3 Kartu Konten (Neo-Brutalist Card)

```html
<div class="bg-[#FAF8F5] border-2 border-[#09090B] shadow-[4px_4px_0_0_#09090B] p-5 md:p-6 relative">
  <!-- Card Header with bottom divider -->
  <div class="border-b-2 border-[#09090B] pb-3 mb-4 flex justify-between items-center">
    <h3 class="font-extrabold text-lg text-[#09090B]">Gedung & Konstruksi</h3>
    <span class="bg-[#FEF08A] border-2 border-[#09090B] px-2.5 py-0.5 text-xs font-bold font-mono">
      DIAJUKAN
    </span>
  </div>
  <p class="text-sm text-[#52525B] leading-relaxed">
    Pintu toilet lantai 2 Gedung C Fakultas Teknik rusak engsel dan tidak dapat dikunci.
  </p>
</div>
```

### 3.4 Formulir & Input Data

- **Input Teks & Dropdown**: Background `#FFFFFF`, `border-2 border-[#09090B]`, font sans-serif tebal, fokus dengan outline ring hitam tebal dan bayangan solid `shadow-[2px_2px_0_0_#09090B]`.
- **Tiptap Rich-Text Editor Container**:
  - Toolbar atas ber-border 2px dengan tombol format bergaya tombol tuts keyboard retro (`B`, `I`, Bullet, Numbered).
  - Area penulisan bergaris tepi tegas dengan character counter badge di sudut kanan bawah (`42 / 2.000 Karakter`).
- **Upload File Dropzone**:
  - Garis putus-putus tebal `border-2 border-dashed border-[#09090B]`.
  - Preview thumbnail foto terlampir dalam bingkai polaroid ber-border hitam dan tombol hapus menggunakan ikon `<X className="w-3.5 h-3.5 text-[#09090B]" />` (bukan emote teks).

### 3.5 Tracking Code Badge (Stempel Resmi Monospace)

```html
<div class="inline-flex items-center gap-2 bg-white border-2 border-[#09090B] px-3 py-1.5 shadow-[2px_2px_0_0_#09090B]">
  <span class="text-xs font-bold text-[#52525B]">KODE TIKET:</span>
  <span class="font-mono font-black text-sm tracking-wider text-[#09090B]">UNTAD-2026-X8K2M1</span>
</div>
```

---

## 4. Struktur Antarmuka & Tata Letak Halaman

### 4.1 Header & Navigasi Utama (Two-Tier Structure)

Mengikuti pola pada gambar referensi:
1. **Tier 1 (Sub-Nav / Utility Bar)**:
   - Tinggi: 36px, background: `#DDD6FE` (Lavender).
   - Tautan kanan berjarak proporsional: *Bantuan*, *Masuk Sivitas*, *Daftar Akun*.
   - Separator vertikal garis halus hitam jika diperlukan.
2. **Tier 2 (Main Navbar)**:
   - Tinggi: 64px, background: `#FAF8F5` (Warm Cream) dengan `border-b-2 border-t-2 border-[#09090B]`.
   - **Kiri**: Logo `<Radio /> SIPRA-UNTAD` dalam kotak terbingkai border tebal (`border-r-2 border-[#09090B] h-full px-6 flex items-center`).
   - **Tengah**: Menu navigasi (*Beranda*, *Lapor*, *Cek Tiket*, *Statistik Publik*).
   - **Kanan**: Action icons dalam kotak border (`border-l-2 border-[#09090B]`), tombol pencarian cepat (`<Search />`) dan tombol favorit / notifikasi (`<Heart />`).

### 4.2 Halaman Beranda & Modul Pelaporan (`/` & `index.tsx`)

#### Wireframe Konseptual Hero Section (Sesuai Referensi)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tier 1:                                              Bantuan | Masuk | Info │
├──────────────┬──────────────────────────────────────────┬───────┬───────────┤
│ [Radio SIPRA]│ Beranda   Lapor Masalah   Lacak Status   │[Heart]│  [Search] │
├──────────────┴──────────────────────────────────────────┴───────┴───────────┤
│                                                                             │
│  Laporkan kerusakan &                               ┌─────────────────────┐ │
│  kawal fasilitas kampus      ┌───────────────┐      │   [ Line-art Mockup]│ │
│  bersama sivitas             │ [UNTAD-TONDO] │      │   Petugas & Bangunan│ │
│                              └───────────────┘      │   Gedung Kampus     │ │
│                                                     │   Ber-outline Hitam │ │
│  Sampaikan keluhan fasilitas fisik di lingkungan    │   Tegas & Minimalis │ │
│  Universitas Tadulako. Cepat, transparan,           └─────────────────────┘ │
│  dan dapat dipantau hingga tuntas.                                          │
│                                                                             │
│  [ LAPOR SEKARANG (ArrowUpRight) ]   [ LACAK TIKET (Search) ]               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Formulir Pelaporan (Step-by-Step Boxed Flow)
- Dikemas dalam panel bertingkat dengan header kotak neo-brutalis.
- **Toggle Mode**: Tab switch tebal antara *Lapor Terbuka (Akun)* dan *Lapor Anonim (Privat)*.
- **Hierarki Lokasi**: Selector bertingkat 4 kolom bergaya kartu blok (Kampus Tondo -> Gedung -> Lantai -> Ruang).
- **Pemilih Urgensi**: 3 pill radio buttons ber-border tebal (`Normal`, `Tinggi`, `Darurat`) dengan warna reaktif saat dipilih.

### 4.3 Halaman Pelacakan Publik (`/track`)

- **Hero Input**: Kotak pencarian besar ber-border tebal dengan font monospace besar untuk memasukkan kode tiket `UNTAD-XXXX-XXXXXX`.
- **Status Stepper (Visual State Timeline)**:
  - Stepper horizontal interaktif dengan nodus kotak (`[1]`, `[2]`, `[3]`) terhubung garis hitam solid 3px.
  - State aktif disorot dengan warna status (misal hijau limau untuk selesai).
  - Riwayat tindakan (*Audit Timeline*) ditampilkan dalam format log vertikal bertanggal WITA dengan badge aktor (Pelapor / Admin / Teknisi).

### 4.4 Modul Kerja Teknisi (Mobile-First Interface)

- Dirancang ergonomis untuk penggunaan lapangan via smartphone di terik kampus.
- **Kartu Tugas Lapangan**:
  - Tombol aksi utama berukuran sentuh besar (min tinggi 48px) dengan border 2px dan bayangan tebal.
  - Penanda prioritas jelas: Pita *badge* darurat merah di pojok kanan atas kartu.
- **Formulir Penyelesaian Kerja**:
  - Komparasi foto side-by-side: Kotak foto sebelum (*Laporan Pelapor*) berdampingan dengan kotak bidik kamera (*Unggah Bukti Selesai*).
  - Field catatan tindakan teknisi teks ringkas ber-border tegas.

### 4.5 Modul Manajemen Admin & Disposisi

- **Tabel Antrean Verifikasi**:
  - Baris tabel ber-border hitam tipis-tegas dengan baris header berwarna `#DDD6FE`.
  - Tombol aksi mikro (*Setujui*, *Tolak*, *Duplikat*) dalam bentuk pill berwarna.
- **Modal Review Penyelesaian (Before vs After Comparison)**:
  - Dua kartu berdampingan berlabel: `[BUKTI AWAL PELAPOR]` dan `[BUKTI FISIK TEKNISI]`.
  - Slider perbandingan foto atau lightbox berbingkai hitam tajam.
  - Aksi verifikasi akhir: Tombol `Tutup Selesai` dengan ikon `<Check className="w-4 h-4" />` (Hijau Limau) dan tombol `Kembalikan ke Teknisi` dengan ikon `<RotateCcw className="w-4 h-4" />` (Kuning/Oranye).

### 4.6 Dashboard Monitoring & Analitik (Pemantau & Eksekutif)

- **Statistik Metrik (Scorecards)**:
  - Grid 4 kolom kartu metrik tebal berlatar warna pastel kontras:
    - Total Laporan (Lavender `#DDD6FE`, ikon `<FileText className="w-5 h-5" />`)
    - Laporan Selesai (Neon Lime `#D9F99D`, ikon `<CheckCircle2 className="w-5 h-5" />`)
    - Sedang Dikerjakan (Oranye `#FED7AA`, ikon `<Wrench className="w-5 h-5" />`)
    - Laporan Darurat (Rose `#FECDD3`, ikon `<AlertTriangle className="w-5 h-5" />`)
  - Angka metrik berukuran *Display XL* (`font-black text-4xl font-mono`).
- **Grafik Distribusi**:
  - Grafik batang & donat berbingkai border 2px dengan palet warna datar (*flat color blocks*) tanpa efek gradasi blur, mempertahankan konsistensi neo-brutalis.

---

## 5. Ilustrasi & Panduan Aset Visual

### 5.1 Gaya Ilustrasi (Line-Art Reference Style)
- **Karakter Garis**: Clean black outlines (*1.5px to 2.5px consistent stroke*).
- **Warna Isian (Fill)**: Didominasi putih transparan, dengan aksen fill terbatas pada elemen kunci menggunakan warna token `#D9F99D` (Lime) atau `#C4B5FD` (Lilac).
- **Subjek Representasi**:
  - Figur mahasiswa menggunakan smartphone melaporkan fasilitas.
  - Petugas teknisi membawa perkakas kerja dengan latar sketsa gedung kampus UNTAD.
  - Ikon mikrofon/antena diadaptasi menjadi ikon sinyal pelaporan/pengeras suara kampus.

### 5.2 Ikonografi (Kebijakan Zero Raw Emojis & Pustaka Lucide)

Sistem melarang keras penggunaan emote/simbol Unicode mentah (seperti emoji HP, centang teks, silang teks, atau simbol panah Unicode). Seluruh kebutuhan visual wajib menggunakan pustaka resmi **`lucide-react`** dengan ketebalan garis tegas (`strokeWidth={2.25}` atau `strokeWidth={2.5}`).

#### Standar Kotak Wadah Ikon (Icon Box Frame)
```tsx
<div className="w-9 h-9 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
  <AlertTriangle className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
</div>
```

#### Pemetaan Lengkap Ikon Lucide untuk SIPRA-UNTAD

| Kategori | Nama Komponen Lucide | Penggunaan dalam Antarmuka |
|---|---|---|
| **Identitas & Navigasi** | `<Radio />` | Logo brand SIPRA-UNTAD |
| | `<Search />` | Tombol dan input pencarian tiket |
| | `<Heart />` | Fitur bookmark / favorit pantau |
| | `<HelpCircle />` | Tautan pusat bantuan sivitas |
| | `<LogIn />` / `<LogOut />` | Autentikasi sivitas & keluar sesi |
| | `<User />` / `<Users />` | Profil akun pelapor & manajemen user admin |
| | `<LayoutDashboard />` | Navigasi menu dashboard peran |
| **Aksi Tombol (CTA)** | `<ArrowUpRight />` | Tombol CTA utama (Lapor Sekarang / Buka Tautan) |
| | `<Check />` | Konfirmasi selesaikan laporan |
| | `<RotateCcw />` | Kembalikan perbaikan ke teknisi |
| | `<X />` | Tutup dialog, hapus thumbnail foto |
| | `<Plus />` | Tambah master kategori / lokasi baru |
| | `<UploadCloud />` / `<ImagePlus />` | Area dropzone unggah foto awal & bukti teknisi |
| | `<Trash2 />` | Hapus / arsipkan data master |
| **State Machine Laporan** | `<Clock />` | Status `Diajukan` (Menunggu Verifikasi) |
| | `<ShieldCheck />` | Status `Diverifikasi` |
| | `<UserCheck />` | Status `Ditugaskan` ke Teknisi |
| | `<Wrench />` | Status `Dalam Perbaikan` |
| | `<FileCheck />` | Status `Menunggu Konfirmasi Admin` |
| | `<CheckCircle2 />` | Status `Selesai` (Tuntas) |
| | `<XCircle />` | Status `Ditolak` |
| | `<Copy />` | Status `Duplikat` |
| **Kategori Infrastruktur**| `<Building2 />` | Gedung & Konstruksi |
| | `<Zap />` | Kelistrikan & Penerangan |
| | `<Droplets />` | Sanitasi & Air Bersih |
| | `<Wifi />` | Jaringan & Fasilitas TI |
| | `<Compass />` | Jalan, Parkir & Area Terbuka |
| | `<Trees />` | Kebersihan & Pertamanan |
| **Tingkat Urgensi** | `<Info />` | Urgensi Normal |
| | `<AlertCircle />` | Urgensi Tinggi |
| | `<AlertTriangle />` | Urgensi Darurat |
| **Audit & Dokumen** | `<History />` | Riwayat audit log / timeline status |
| | `<FileText />` | Lembar ringkasan laporan |
| | `<MapPin />` | Penunjuk hierarki lokasi gedung & ruangan |

---

## 6. Aksesibilitas (a11y) & Panduan Responsivitas

1. **Kontras Teks (WCAG 2.1 AA Compliant)**:
   - Teks hitam `#09090B` di atas semua latar pastel (Lilac, Lime, Off-White, Yellow) menghasilkan rasio kontras > `7:1` (melampaui standar minimal AAA untuk teks biasa).
2. **Keyboard Focus States**:
   - Focus ring tegas dengan offset: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09090B] focus-visible:ring-offset-2`.
3. **Motion & Animasi Taktil**:
   - Transisi pergeseran mikrointeraksi tombol: `duration-150 ease-out`.
   - Mengakomodasi preferensi pengguna: `@media (prefers-reduced-motion: reduce)` menonaktifkan pergeseran hover translate dan rotasi tilt.
4. **Skalabilitas Layar**:
   - **Mobile (< 768px)**: Drop shadow diperkecil dari `4px` menjadi `3px`, header bertumpuk secara vertikal yang rapi, tombol pengerjaan teknisi memenuhi lebar layar (*full-width*).
   - **Desktop (>= 1024px)**: Tata letak multi-kolom berdampingan dengan penekanan visual pada hero section dan perbandingan bukti visual.

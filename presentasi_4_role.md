# Presentasi SIPRA-UNTAD: Alur Empat Role

**Proyek:** SIPRA-UNTAD (Sistem Pelaporan Infrastruktur Kampus Universitas Tadulako)  
**Tujuan:** Mendigitalisasi proses pelaporan hingga penyelesaian kerusakan fasilitas kampus secara terstruktur, transparan, dan dapat dipantau.  
**Commit acuan terbaru:** `9e9edc4` - perbaikan akses tombol membuat laporan dan ergonomi sentuhan pada perangkat seluler.

## Pembukaan - 30 Detik

Selamat [pagi/siang]. Kami akan mempresentasikan SIPRA-UNTAD, sebuah aplikasi web responsif untuk pelaporan kerusakan infrastruktur kampus.

Sistem ini menghubungkan empat pihak dalam satu alur kerja: pelapor, administrator sarana-prasarana, teknisi lapangan, dan pimpinan sebagai pemantau. Dengan demikian, laporan tidak berhenti pada pengaduan, tetapi dapat ditelusuri sampai bukti perbaikannya diverifikasi.

Alur utamanya adalah:

`Reporter -> Admin -> Technician -> Admin -> Monitor`

---

## Bagian 1 - Reporter / Pelapor

**Durasi:** 1,5-2 menit  
**Akun demo:** `pelapor@untad.ac.id` / `Password123!`

### Narasi Presentasi

Role pertama adalah **Reporter** atau pelapor. Role ini digunakan oleh sivitas akademika untuk melaporkan kerusakan fasilitas kampus, misalnya kerusakan listrik, sanitasi, atau gedung.

Pelapor dapat mengirim laporan melalui portal publik tanpa login atau menggunakan akun terverifikasi. Pada formulir laporan, pengguna mengisi judul, kategori kerusakan, lokasi bertingkat, detail lokasi, tingkat urgensi, deskripsi, serta foto kondisi awal.

Setelah laporan terkirim, sistem menghasilkan kode pelacak unik dengan format `UNTAD-2026-XXXXXX`. Kode ini dapat digunakan untuk melacak progres laporan, khususnya bagi pelapor anonim.

Jika pelapor masuk menggunakan akun, ia memperoleh dashboard pribadi. Dashboard tersebut menampilkan seluruh laporan miliknya, filter berdasarkan status, detail laporan, foto, dan riwayat perubahan status. Pelapor juga dapat membatalkan laporan selama statusnya masih **Diajukan**.

Keamanan pelaporan anonim dijaga melalui honeypot untuk mengurangi bot dan pembatasan frekuensi pengiriman berbasis hash IP. Sistem tidak menyimpan IP mentah pelapor.

### Demo Yang Ditunjukkan

1. Masuk sebagai akun pelapor.
2. Buka dashboard reporter dan klik **Buat Laporan**.
3. Isi contoh laporan: kategori, lokasi, urgensi, deskripsi, dan foto kondisi awal.
4. Kirim laporan, lalu tunjukkan kode pelacak yang diterima.
5. Buka kartu laporan untuk memperlihatkan status, detail, dan riwayat prosesnya.

### Poin Teknis Penting

- Formulir menyimpan deskripsi terstruktur dari editor Tiptap dalam format JSON dan teks biasa.
- Foto laporan disimpan pada bucket Supabase Storage privat dan diakses melalui signed URL yang berlaku terbatas.
- Dashboard reporter hanya dapat diakses oleh sesi dengan role `reporter`.
- Commit terbaru memperbaiki tombol pembuatan laporan pada perangkat mobile agar tetap dapat disentuh dan digunakan dengan nyaman.

### Kalimat Transisi

Setelah laporan dikirim, laporan tersebut belum langsung dikerjakan. Tahap berikutnya berada di tangan administrator sarana-prasarana untuk memverifikasi dan mendisposisikan laporan.

---

## Bagian 2 - Admin Sarpras

**Durasi:** 2 menit  
**Akun demo:** `admin@untad.ac.id` / `Password123!`

### Narasi Presentasi

Role kedua adalah **Admin Sarpras**. Admin berperan sebagai pengendali utama siklus hidup laporan. Admin memastikan laporan valid, menentukan tindak lanjutnya, dan menjaga kualitas data operasional.

Di dashboard admin, laporan dapat ditinjau melalui daftar dan panel detail. Admin dapat melihat data pelapor bila tersedia, lokasi, kategori, urgensi, deskripsi, foto awal, dan jejak aktivitas laporan.

Untuk laporan yang valid, admin melakukan verifikasi dan memilih teknisi yang bertanggung jawab. Ketika teknisi ditugaskan, status laporan berpindah menjadi **Ditugaskan**.

Admin juga memiliki opsi untuk menolak laporan apabila tidak sesuai, atau menandainya sebagai duplikat jika masalah yang sama telah dilaporkan sebelumnya. Laporan yang sudah berada pada status akhir tidak dapat diubah kembali secara sembarangan.

Setelah teknisi mengirim bukti hasil perbaikan, admin memeriksa catatan dan foto bukti tersebut. Admin dapat menyetujui hasil pekerjaan menjadi **Selesai**, atau mengembalikannya kepada teknisi dengan alasan perbaikan tambahan.

Selain pengelolaan laporan, admin mengelola data master kategori dan lokasi serta data staf operasional yang digunakan dalam proses disposisi.

### Demo Yang Ditunjukkan

1. Masuk sebagai admin dan buka daftar laporan.
2. Buka detail salah satu laporan berstatus **Diajukan**.
3. Verifikasi laporan dan pilih urgensi bila diperlukan.
4. Pilih teknisi untuk ditugaskan, lalu tunjukkan perubahan status menjadi **Ditugaskan**.
5. Jika tersedia laporan hasil kerja teknisi, buka detailnya dan tunjukkan proses konfirmasi penyelesaian.
6. Tunjukkan menu data master kategori atau lokasi secara singkat.

### Poin Teknis Penting

- Aksi verifikasi, penolakan, penandaan duplikat, penugasan teknisi, dan konfirmasi hasil kerja dijalankan melalui server function.
- Server memvalidasi bahwa teknisi yang dipilih memang memiliki role `technician`.
- Setiap perubahan status dan intervensi dicatat ke tabel `report_timeline` sebagai audit trail.
- Akses dashboard ini dibatasi untuk role `admin`.

### Kalimat Transisi

Setelah admin menetapkan penanggung jawab, teknisi menerima tugas pada dashboardnya dan melanjutkan ke proses penanganan di lapangan.

---

## Bagian 3 - Technician / Teknisi Lapangan

**Durasi:** 1,5-2 menit  
**Akun demo:** `teknisi@untad.ac.id` / `Password123!`

### Narasi Presentasi

Role ketiga adalah **Technician** atau teknisi lapangan. Dashboard teknisi berfokus pada pekerjaan yang memang ditugaskan kepada akun teknisi tersebut, sehingga teknisi tidak dapat mengakses atau mengubah tugas milik teknisi lain.

Pada dashboard, teknisi dapat mencari dan menyaring tugas berdasarkan status. Setiap kartu tugas menampilkan informasi inti, yaitu judul laporan, lokasi, kategori, deskripsi, urgensi, serta foto kondisi awal dari pelapor.

Saat pekerjaan akan dimulai, teknisi menekan aksi mulai pengerjaan. Status laporan kemudian berubah dari **Ditugaskan** menjadi **Dalam Perbaikan**.

Setelah pekerjaan lapangan selesai, teknisi mengirimkan hasil penanganan. Teknisi wajib menambahkan catatan pekerjaan dan dapat mengunggah foto bukti perbaikan. Laporan kemudian berpindah ke status **Menunggu Konfirmasi Admin**.

Tahap terakhir tetap dilakukan oleh admin agar laporan tidak langsung dianggap selesai tanpa pemeriksaan bukti.

### Demo Yang Ditunjukkan

1. Masuk sebagai teknisi dan buka daftar tugas.
2. Tunjukkan bahwa daftar berisi tugas yang ditugaskan kepada teknisi tersebut.
3. Buka satu tugas untuk memperlihatkan detail lokasi dan foto kondisi awal.
4. Tekan **Mulai Pengerjaan** dan tunjukkan perubahan status.
5. Buka formulir penyelesaian, isi catatan, unggah foto bukti, lalu kirim hasil pekerjaan.

### Poin Teknis Penting

- Server memeriksa sesi dan role `technician` sebelum menjalankan aksi teknisi.
- Server memastikan tugas memang ditugaskan kepada teknisi yang sedang masuk.
- Tugas hanya dapat dimulai dari status `assigned` dan hanya dapat diajukan selesai dari status `in_progress`.
- Foto bukti perbaikan disimpan secara privat pada Supabase Storage.

### Kalimat Transisi

Data dari seluruh proses tersebut tidak hanya digunakan untuk menyelesaikan laporan satu per satu, tetapi juga dirangkum menjadi informasi manajerial bagi pimpinan kampus.

---

## Bagian 4 - Monitor / Pimpinan

**Durasi:** 1,5-2 menit  
**Akun demo:** `pemantau@untad.ac.id` / `Password123!`

### Narasi Presentasi

Role keempat adalah **Monitor** atau pimpinan. Role ini bersifat baca-saja dan dirancang untuk melihat kondisi layanan infrastruktur secara menyeluruh tanpa mengubah data operasional.

Dashboard monitor menyediakan indikator kinerja utama, seperti total laporan, jumlah laporan selesai, persentase penyelesaian, laporan yang masih berjalan atau menunggu tindak lanjut, laporan darurat, serta rata-rata waktu penyelesaian dari laporan hingga selesai.

Pimpinan dapat mengubah rentang waktu analisis menjadi tujuh hari terakhir, tiga puluh hari terakhir, satu semester, atau seluruh data. Data pada dashboard akan menyesuaikan dengan periode yang dipilih.

Selain KPI, dashboard menampilkan distribusi laporan berdasarkan kategori, hotspot atau lokasi gedung dengan laporan terbanyak, serta tabel laporan terbaru. Detail setiap laporan dapat dibuka untuk melihat status, informasi kerusakan, dokumentasi, dan riwayat proses.

Melalui role ini, data operasional dapat digunakan sebagai dasar penentuan prioritas pemeliharaan, evaluasi kecepatan layanan, dan perencanaan anggaran fasilitas kampus.

### Demo Yang Ditunjukkan

1. Masuk sebagai pemantau dan buka dashboard monitor.
2. Tunjukkan kartu KPI utama.
3. Ubah filter periode, misalnya dari 30 hari menjadi 7 hari, lalu jelaskan bahwa data diperbarui sesuai rentang waktu.
4. Tunjukkan grafik distribusi kategori dan daftar hotspot lokasi.
5. Buka detail salah satu laporan dari tabel untuk memperlihatkan transparansi proses.

### Poin Teknis Penting

- Role `monitor` hanya memiliki akses baca terhadap data dashboard dan detail laporan.
- Role `admin` juga dapat mengakses panel monitor untuk kebutuhan pengawasan operasional.
- Data analitik dihitung dari laporan dan timeline, termasuk metrik rata-rata waktu penyelesaian.
- Filter rentang waktu tersedia untuk 7 hari, 30 hari, 1 semester, dan seluruh data.

---

## Penutup - 30 Detik

SIPRA-UNTAD membentuk satu siklus layanan yang utuh: pelapor mengirim bukti masalah, admin memverifikasi dan mendisposisikan, teknisi menangani serta mengunggah bukti perbaikan, admin mengonfirmasi hasil, dan pimpinan memantau kualitas layanan melalui data analitik.

Mesin status laporan memastikan setiap tahap jelas dan dapat ditelusuri:

`Diajukan -> Diverifikasi -> Ditugaskan -> Dalam Perbaikan -> Menunggu Konfirmasi Admin -> Selesai`

Alternatif status akhir yang tersedia adalah **Ditolak** dan **Duplikat**. Setiap perubahan direkam dalam audit trail sehingga proses penanganan fasilitas kampus lebih transparan, terukur, dan akuntabel.

## Pembagian Waktu Rekomendasi

| Bagian | Pembicara | Durasi |
| --- | --- | --- |
| Pembukaan | Moderator / Pembicara 1 | 30 detik |
| Reporter | Pembicara 1 | 1,5-2 menit |
| Admin Sarpras | Pembicara 2 | 2 menit |
| Technician | Pembicara 3 | 1,5-2 menit |
| Monitor / Pimpinan | Pembicara 4 | 1,5-2 menit |
| Penutup | Pembicara 4 | 30 detik |
| Total | Seluruh tim | Sekitar 8-10 menit |

## Catatan Persiapan Demo

- Gunakan laporan yang telah dibuat sebelumnya agar seluruh status dapat diperlihatkan tanpa harus menyelesaikan alur dari awal saat presentasi.
- Siapkan minimal satu laporan pada setiap tahap: `Diajukan`, `Ditugaskan`, `Dalam Perbaikan`, `Menunggu Konfirmasi Admin`, dan `Selesai`.
- Gunakan foto contoh yang relevan untuk memperjelas fitur dokumentasi kondisi awal dan hasil perbaikan.
- Pastikan akun demo dapat masuk sebelum presentasi dimulai.
- Saat mendemokan tampilan mobile, tunjukkan bahwa tombol **Buat Laporan** dapat diakses dan disentuh dengan baik, sesuai perbaikan pada commit terbaru.

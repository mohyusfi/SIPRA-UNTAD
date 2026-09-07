import 'dotenv/config'
import { db } from './index'
import { categories, locations } from './schema'

async function seed() {
  console.log('Seeding master data UNTAD...')

  const initialCategories = [
    { id: 'cat-gedung', name: 'Gedung & Konstruksi' },
    { id: 'cat-listrik', name: 'Kelistrikan & Penerangan' },
    { id: 'cat-sanitasi', name: 'Sanitasi & Air Bersih' },
    { id: 'cat-ti', name: 'Jaringan & Fasilitas TI' },
    { id: 'cat-jalan', name: 'Jalan, Parkir & Area Terbuka' },
    { id: 'cat-kebersihan', name: 'Kebersihan & Pertamanan' },
  ]

  for (const cat of initialCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing()
  }

  const initialLocations = [
    {
      id: 'loc-rektorat',
      campus: 'Bumi Tadulako Tondo',
      building: 'Gedung Rektorat UNTAD',
      floor: 'Lantai 1',
      roomOrArea: 'Lobi Utama',
    },
    {
      id: 'loc-gkb',
      campus: 'Bumi Tadulako Tondo',
      building: 'Gedung Kuliah Bersama (GKB)',
      floor: 'Lantai 2',
      roomOrArea: 'Ruang Kelas GKB-201',
    },
    {
      id: 'loc-teknik',
      campus: 'Bumi Tadulako Tondo',
      building: 'Fakultas Teknik',
      floor: 'Lantai 1',
      roomOrArea: 'Gedung Jurusan Informatika',
    },
    {
      id: 'loc-mipa',
      campus: 'Bumi Tadulako Tondo',
      building: 'Fakultas MIPA',
      floor: 'Lantai 1',
      roomOrArea: 'Laboratorium Terpadu',
    },
    {
      id: 'loc-kedokteran',
      campus: 'Bumi Tadulako Tondo',
      building: 'Fakultas Kedokteran',
      floor: 'Lantai 1',
      roomOrArea: 'Gedung Dekanat',
    },
    {
      id: 'loc-perpus',
      campus: 'Bumi Tadulako Tondo',
      building: 'Perpustakaan Pusat UNTAD',
      floor: 'Lantai 1',
      roomOrArea: 'Ruang Baca Umum',
    },
    {
      id: 'loc-auditorium',
      campus: 'Bumi Tadulako Tondo',
      building: 'Auditorium & Lapangan Upacara',
      floor: 'Ground',
      roomOrArea: 'Plaza Utama',
    },
  ]

  for (const loc of initialLocations) {
    await db.insert(locations).values(loc).onConflictDoNothing()
  }

  console.log('Seeding selesai!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Error saat seeding:', err)
  process.exit(1)
})

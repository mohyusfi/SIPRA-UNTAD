import 'dotenv/config'
import { consumeRateLimit } from '../app/lib/rate-limit.server'
import { db } from '../app/db'
import { rateLimits } from '../app/db/schema'
import { eq } from 'drizzle-orm'

async function runTests() {
  console.log('=== MEMULAI PENGUJIAN RATE LIMITING POSTGRESQL ===\n')

  const testKeyA = `test:deviceA:${Date.now()}`
  const testKeyB = `test:deviceB:${Date.now()}`
  const maxRequests = 5
  const windowSeconds = 60

  try {
    console.log('[Test 1] Menguji kuota normal untuk Perangkat A (Maksimal 5 request):')
    for (let i = 1; i <= maxRequests; i++) {
      const result = await consumeRateLimit(testKeyA, maxRequests, windowSeconds)
      console.log(
        `  Request #${i}: Allowed = ${result.allowed}, Sisa Kuota = ${result.remaining}, Reset Dalam = ${result.resetInSeconds}s`,
      )
      if (!result.allowed) {
        throw new Error(`Request #${i} seharusnya diizinkan tetapi ditolak!`)
      }
    }
    console.log('-> Berhasil: Semua 5 request awal Perangkat A diizinkan.\n')

    console.log('[Test 2] Menguji penolakan request ke-6 (Rate limit terpicu):')
    const blockedResult = await consumeRateLimit(testKeyA, maxRequests, windowSeconds)
    console.log(
      `  Request #6: Allowed = ${blockedResult.allowed}, Sisa Kuota = ${blockedResult.remaining}, Reset Dalam = ${blockedResult.resetInSeconds}s`,
    )
    if (blockedResult.allowed) {
      throw new Error('Request #6 seharusnya ditolak tetapi diizinkan!')
    }
    console.log('-> Berhasil: Request ke-6 ditolak dengan tepat.\n')

    console.log('[Test 3] Menguji isolasi perangkat (Perangkat B di Wi-Fi yang sama):')
    const deviceBResult = await consumeRateLimit(testKeyB, maxRequests, windowSeconds)
    console.log(
      `  Perangkat B Request #1: Allowed = ${deviceBResult.allowed}, Sisa Kuota = ${deviceBResult.remaining}`,
    )
    if (!deviceBResult.allowed || deviceBResult.remaining !== maxRequests - 1) {
      throw new Error('Perangkat B seharusnya memiliki kuota penuh terpisah!')
    }
    console.log('-> Berhasil: Perangkat B memiliki kuota terpisah dan tidak terblokir oleh Perangkat A.\n')

    console.log('[Test 4] Verifikasi data tersimpan di tabel PostgreSQL:')
    const records = await db
      .select()
      .from(rateLimits)
      .where(eq(rateLimits.key, testKeyA))
    console.log(`  Ditemukan ${records.length} record untuk ${testKeyA}: Count = ${records[0]?.count}`)
    if (records.length === 0 || records[0].count !== maxRequests) {
      throw new Error('Data record di database tidak sesuai!')
    }
    console.log('-> Berhasil: Record tercatat dengan benar di Supabase PostgreSQL.\n')

    // Cleanup test data
    console.log('[Cleanup] Membersihkan data uji dari database...')
    await db.delete(rateLimits).where(eq(rateLimits.key, testKeyA))
    await db.delete(rateLimits).where(eq(rateLimits.key, testKeyB))
    console.log('-> Berhasil: Data uji telah dibersihkan.\n')

    console.log('=== SEMUA PENGUJIAN RATE LIMITING LOLOS 100% ===')
    process.exit(0)
  } catch (error) {
    console.error('\n[GAGAL] Pengujian gagal:', error)
    // Cleanup on failure
    try {
      await db.delete(rateLimits).where(eq(rateLimits.key, testKeyA))
      await db.delete(rateLimits).where(eq(rateLimits.key, testKeyB))
    } catch {}
    process.exit(1)
  }
}

void runTests()

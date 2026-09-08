import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getBatchSignedUrls(
  fileKeys: string[],
  bucket = 'report-attachments',
  expiresIn = 3600,
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>()
  const uniqueKeys = Array.from(new Set(fileKeys.filter(Boolean)))
  if (uniqueKeys.length === 0) {
    return urlMap
  }

  try {
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrls(uniqueKeys, expiresIn)

    if (data) {
      for (const item of data) {
        if (item.path && (item.signedUrl || (item as any).signedURL)) {
          urlMap.set(item.path, item.signedUrl || (item as any).signedURL)
        }
      }
    }
  } catch {
    // Fallback if batch call fails
  }

  return urlMap
}

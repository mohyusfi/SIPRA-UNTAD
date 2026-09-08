export interface CompressionResult {
  name: string
  type: 'image/webp'
  size: number
  originalSize: number
  base64: string
  savingsPercent: number
}

interface CompressOptions {
  maxDimension?: number
  quality?: number
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function calculateTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number,
): { width: number; height: number } {
  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: srcWidth, height: srcHeight }
  }

  if (srcWidth > srcHeight) {
    const ratio = maxDimension / srcWidth
    return {
      width: maxDimension,
      height: Math.round(srcHeight * ratio),
    }
  }

  const ratio = maxDimension / srcHeight
  return {
    width: Math.round(srcWidth * ratio),
    height: maxDimension,
  }
}

async function loadSourceImage(
  source: File | Blob,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(source)
    } catch {
      // Fallback
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(source)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat file gambar untuk dikompresi.'))
    }

    img.src = url
  })
}

export async function compressImageToWebP(
  source: File | Blob,
  fileName?: string,
  options: CompressOptions = {},
): Promise<CompressionResult> {
  const maxDimension = options.maxDimension ?? 1600
  const quality = options.quality ?? 0.8
  const originalSize = source.size

  const img = await loadSourceImage(source)
  const srcWidth = Number(img.width)
  const srcHeight = Number(img.height)

  const { width, height } = calculateTargetDimensions(
    srcWidth,
    srcHeight,
    maxDimension,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) {
    if ('close' in img && typeof img.close === 'function') {
      img.close()
    }
    throw new Error('Gagal menginisialisasi 2D Canvas Context.')
  }

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)

  if ('close' in img && typeof img.close === 'function') {
    img.close()
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengonversi gambar ke format WebP.'))
          return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          const rawName =
            fileName || (source instanceof File ? source.name : 'foto.webp')
          const baseName = rawName.replace(/\.[^/.]+$/, '')
          const outputName = `${baseName}.webp`
          const compressedSize = blob.size

          const savingsPercent =
            originalSize > 0
              ? Math.max(
                  0,
                  Math.round(
                    ((originalSize - compressedSize) / originalSize) * 100,
                  ),
                )
              : 0

          resolve({
            name: outputName,
            type: 'image/webp',
            size: compressedSize,
            originalSize,
            base64,
            savingsPercent,
          })
        }

        reader.onerror = () => {
          reject(new Error('Gagal membaca data base64 dari WebP blob.'))
        }

        reader.readAsDataURL(blob)
      },
      'image/webp',
      quality,
    )
  })
}

export function compressCanvasToWebP(
  canvas: HTMLCanvasElement,
  fileName: string,
  quality = 0.8,
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengompresi hasil kanvas ke WebP.'))
          return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = reader.result as string
          const baseName = fileName.replace(/\.[^/.]+$/, '')
          const outputName = `${baseName}.webp`
          const compressedSize = blob.size

          resolve({
            name: outputName,
            type: 'image/webp',
            size: compressedSize,
            originalSize: compressedSize,
            base64,
            savingsPercent: 0,
          })
        }

        reader.onerror = () => {
          reject(new Error('Gagal membaca data WebP dari kanvas.'))
        }

        reader.readAsDataURL(blob)
      },
      'image/webp',
      quality,
    )
  })
}

import * as React from 'react'
import {
  UploadCloud,
  Camera,
  CameraOff,
  SwitchCamera,
  RotateCcw,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { cn } from '~/lib/utils'

export interface UploadedPhoto {
  name: string
  type: string
  size: number
  base64: string
}

interface PhotoUploaderProps {
  photos: UploadedPhoto[]
  onChange: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
  maxSizeBytes?: number
  error?: string
}

export function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 5,
  maxSizeBytes = 5 * 1024 * 1024,
  error,
}: PhotoUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)

  const [dragOver, setDragOver] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)

  // In-App Camera Modal State
  const [isCameraOpen, setIsCameraOpen] = React.useState(false)
  const [cameraFacing, setCameraFacing] = React.useState<'environment' | 'user'>('environment')
  const [cameraLoading, setCameraLoading] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [capturedPhoto, setCapturedPhoto] = React.useState<UploadedPhoto | null>(null)

  // Stop camera tracks cleanly
  const stopCameraStream = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  // Start camera stream based on facing mode
  const startCameraStream = React.useCallback(async (facing: 'environment' | 'user') => {
    stopCameraStream()
    setCameraLoading(true)
    setCameraError(null)

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError('Peramban atau perangkat tidak mendukung akses kamera secara langsung.')
      setCameraLoading(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {
          // Ignore play interruption errors
        })
      }
      setCameraLoading(false)
    } catch (err: unknown) {
      console.error('Gagal mengakses kamera:', err)
      const errName = (err as Error)?.name || ''
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setCameraError('Izin akses kamera ditolak. Berikan izin kamera di peramban Anda.')
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setCameraError('Perangkat kamera tidak ditemukan.')
      } else {
        setCameraError('Kamera tidak dapat diakses. Silakan pilih dari galeri/berkas lokal.')
      }
      setCameraLoading(false)
    }
  }, [stopCameraStream])

  // Lifecycle when camera modal opens or facing changes
  React.useEffect(() => {
    if (isCameraOpen && !capturedPhoto) {
      void startCameraStream(cameraFacing)
    }

    return () => {
      stopCameraStream()
    }
  }, [isCameraOpen, cameraFacing, capturedPhoto, startCameraStream, stopCameraStream])

  const handleOpenLocalPicker = () => {
    fileInputRef.current?.click()
  }

  const handleOpenLiveCamera = () => {
    setLocalError(null)
    if (photos.length >= maxPhotos) {
      setLocalError(`Maksimal hanya ${maxPhotos} foto yang diizinkan.`)
      return
    }
    setCapturedPhoto(null)
    setCameraFacing('environment')
    setIsCameraOpen(true)
  }

  const handleCloseCameraModal = () => {
    stopCameraStream()
    setCapturedPhoto(null)
    setIsCameraOpen(false)
  }

  const handleToggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const handleSnapPhoto = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    const width = video.videoWidth || 1280
    const height = video.videoHeight || 720
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // If front camera, flip horizontally to feel like a mirror
    if (cameraFacing === 'user') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, width, height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

    const base64Prefix = 'data:image/jpeg;base64,'
    const sizeInBytes = Math.round(((dataUrl.length - base64Prefix.length) * 3) / 4)
    const timestamp = Date.now()
    const fileName = `kamera-${cameraFacing === 'environment' ? 'belakang' : 'depan'}-${timestamp}.jpg`

    setCapturedPhoto({
      name: fileName,
      type: 'image/jpeg',
      size: sizeInBytes,
      base64: dataUrl,
    })

    // Pause stream while previewing
    stopCameraStream()
  }

  const handleRetake = () => {
    setCapturedPhoto(null)
  }

  const handleConfirmPhoto = () => {
    if (!capturedPhoto) return

    if (capturedPhoto.size > maxSizeBytes) {
      setLocalError('Foto hasil jepretan melebihi batas 5MB.')
      handleCloseCameraModal()
      return
    }

    onChange([...photos, capturedPhoto])
    handleCloseCameraModal()
  }

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return
    setLocalError(null)

    const availableSlots = maxPhotos - photos.length
    if (availableSlots <= 0) {
      setLocalError(`Maksimal hanya ${maxPhotos} foto yang diizinkan.`)
      return
    }

    const filesToProcess = Array.from(fileList).slice(0, availableSlots)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']

    filesToProcess.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        setLocalError('Hanya format gambar JPEG, PNG, dan WebP yang didukung.')
        return
      }

      if (file.size > maxSizeBytes) {
        setLocalError(
          `Ukuran file "${file.name}" melebihi batas 5MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        )
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        onChange([
          ...photos,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            base64,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, idx) => idx !== index)
    onChange(updated)
    setLocalError(null)
  }

  return (
    <div className="space-y-3">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          processFiles(e.target.files)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }}
      />

      {/* Main Uploader Box */}
      {photos.length < maxPhotos && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            processFiles(e.dataTransfer.files)
          }}
          className={cn(
            'border-2 border-dashed border-[#09090B] bg-[#FAF8F5] p-5 md:p-6 text-center transition-all flex flex-col items-center justify-center gap-3',
            dragOver && 'bg-[#D9F99D] border-solid',
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <UploadCloud className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div className="w-10 h-10 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <Camera className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
            </div>
          </div>

          <div>
            <p className="text-xs md:text-sm font-bold text-[#09090B]">
              Unggah Foto Bukti Kerusakan Fasilitas
            </p>
            <p className="text-[11px] text-[#52525B] mt-0.5 font-mono">
              JPEG, PNG, WebP • Maks. 5MB per berkas • ({photos.length}/{maxPhotos} Foto Terpilih)
            </p>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-1 w-full max-w-md">
            <button
              type="button"
              onClick={handleOpenLocalPicker}
              className="flex-1 px-4 py-2.5 text-xs md:text-sm font-bold bg-white text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-neutral-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              <span>Pilih Berkas / Galeri</span>
            </button>

            <button
              type="button"
              onClick={handleOpenLiveCamera}
              className="flex-1 px-4 py-2.5 text-xs md:text-sm font-bold bg-[#D9F99D] text-[#09090B] border-2 border-[#09090B] shadow-[3px_3px_0_0_#09090B] hover:bg-[#BEF264] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#09090B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              <span>Ambil Foto Langsung</span>
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {(error || localError) && (
        <div className="p-2.5 border-2 border-[#09090B] bg-[#FECDD3] flex items-center gap-2 text-xs font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#09090B]" strokeWidth={2.5} />
          <span>{error || localError}</span>
        </div>
      )}

      {/* Thumbnail Previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="group relative border-2 border-[#09090B] bg-white p-1.5 shadow-[3px_3px_0_0_#09090B] flex flex-col"
            >
              <div className="relative aspect-square w-full overflow-hidden border border-[#09090B] bg-neutral-100">
                <img
                  src={photo.base64}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-[#FECDD3] border-2 border-[#09090B] flex items-center justify-center text-[#09090B] shadow-[1px_1px_0_0_#09090B] hover:bg-rose-300 cursor-pointer"
                  title="Hapus foto"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>

              <div className="mt-1 px-0.5">
                <p className="text-[10px] font-bold text-[#09090B] truncate" title={photo.name}>
                  {photo.name}
                </p>
                <p className="text-[9px] font-mono text-[#52525B]">
                  {(photo.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* IN-APP CAMERA MODAL                                                       */}
      {/* ========================================================================= */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#09090B]/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#FAF8F5] border-3 border-[#09090B] shadow-[8px_8px_0_0_#09090B] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-3 border-b-2 border-[#09090B] bg-[#C4B5FD] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[1px_1px_0_0_#09090B]">
                  <Camera className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs md:text-sm text-[#09090B] uppercase">
                    Kamera Pelaporan
                  </h3>
                  <p className="text-[10px] font-bold text-[#09090B]/80 font-mono">
                    {capturedPhoto
                      ? 'Pratinjau Hasil Foto'
                      : cameraFacing === 'environment'
                        ? 'Kamera Belakang (Fasilitas)'
                        : 'Kamera Depan'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!capturedPhoto && !cameraError && (
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    className="h-7 px-2 border-2 border-[#09090B] bg-white hover:bg-neutral-100 flex items-center gap-1 text-[11px] font-bold text-[#09090B] shadow-[1px_1px_0_0_#09090B] active:translate-y-[1px] cursor-pointer"
                    title="Ganti kamera depan/belakang"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Putar Kamera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCloseCameraModal}
                  className="w-7 h-7 border-2 border-[#09090B] bg-white hover:bg-[#FECDD3] flex items-center justify-center text-[#09090B] shadow-[1px_1px_0_0_#09090B] active:translate-y-[1px] cursor-pointer"
                  title="Tutup kamera"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Viewfinder View / Preview Area */}
            <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden border-b-2 border-[#09090B]">
              {capturedPhoto ? (
                // Captured Photo Confirmation Preview
                <img
                  src={capturedPhoto.base64}
                  alt="Pratinjau Foto"
                  className="w-full h-full object-contain bg-black"
                />
              ) : cameraError ? (
                // Camera Error State
                <div className="p-6 text-center text-white space-y-3 max-w-sm">
                  <div className="w-12 h-12 mx-auto border-2 border-white bg-rose-600 flex items-center justify-center">
                    <CameraOff className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xs font-bold leading-relaxed">
                    {cameraError}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCameraModal()
                      handleOpenLocalPicker()
                    }}
                    className="px-4 py-2 bg-white text-[#09090B] text-xs font-bold border-2 border-[#09090B] shadow-[2px_2px_0_0_#FAF8F5] hover:bg-neutral-100 cursor-pointer"
                  >
                    Pilih dari Berkas / Galeri
                  </button>
                </div>
              ) : (
                // Live Camera View
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      'w-full h-full object-cover',
                      cameraFacing === 'user' && '-scale-x-100',
                    )}
                  />
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs font-mono font-bold">
                      Menghubungkan kamera...
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Controls Bar */}
            <div className="p-4 bg-[#FAF8F5] flex items-center justify-between">
              {capturedPhoto ? (
                // Actions after taking photo
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="flex-1 px-4 py-2.5 border-2 border-[#09090B] bg-white text-[#09090B] font-bold text-xs md:text-sm shadow-[2px_2px_0_0_#09090B] active:translate-y-[1px] hover:bg-neutral-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                    <span>Foto Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    className="flex-1 px-4 py-2.5 border-2 border-[#09090B] bg-[#D9F99D] text-[#09090B] font-bold text-xs md:text-sm shadow-[2px_2px_0_0_#09090B] active:translate-y-[1px] hover:bg-[#BEF264] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                    <span>Gunakan Foto Ini</span>
                  </button>
                </div>
              ) : (
                // Live View Controls
                <div className="w-full flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    disabled={Boolean(cameraError) || cameraLoading}
                    className="px-3 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-bold text-xs shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <SwitchCamera className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                    <span>{cameraFacing === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
                  </button>

                  {/* Big Shutter Button */}
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    disabled={Boolean(cameraError) || cameraLoading}
                    className="w-14 h-14 rounded-full border-3 border-[#09090B] bg-[#D9F99D] shadow-[3px_3px_0_0_#09090B] flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer transition-all"
                    title="Jepret Foto"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-[#09090B] bg-white flex items-center justify-center">
                      <Camera className="w-5 h-5 text-[#09090B]" strokeWidth={2.5} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseCameraModal}
                    className="px-3 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-bold text-xs shadow-[2px_2px_0_0_#09090B] hover:bg-neutral-100 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import * as React from 'react'
import {
  Building2,
  MapPin,
  Search,
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react'

export interface LocationItem {
  id: string
  campus: string
  building: string
  floor: string | null
  roomOrArea: string | null
}

interface LocationCascadingSelectProps {
  locations: LocationItem[]
  selectedLocationId: string
  locationDetail: string
  onLocationChange: (id: string) => void
  onDetailChange: (detail: string) => void
  error?: string
}

export function LocationCascadingSelect({
  locations,
  selectedLocationId,
  locationDetail,
  onLocationChange,
  onDetailChange,
  error,
}: LocationCascadingSelectProps) {
  // Fast lookup map for location items (Vercel best practice: js-index-maps)
  const locationMap = React.useMemo(() => {
    const map = new Map<string, LocationItem>()
    locations.forEach((loc) => map.set(loc.id, loc))
    return map
  }, [locations])

  // Unique sorted buildings list
  const uniqueBuildings = React.useMemo(() => {
    const set = new Set<string>()
    locations.forEach((loc) => set.add(loc.building))
    return Array.from(set).sort()
  }, [locations])

  // Derive current selection directly during render (Vercel best practice: rerender-derived-state-no-effect)
  const selectedLocation = React.useMemo(() => {
    return locationMap.get(selectedLocationId)
  }, [locationMap, selectedLocationId])

  const currentBuilding = selectedLocation?.building ?? uniqueBuildings[0] ?? ''

  // Rooms available for the currently derived building
  const availableRooms = React.useMemo(() => {
    if (!currentBuilding) return []
    return locations.filter((loc) => loc.building === currentBuilding)
  }, [locations, currentBuilding])

  // Interaction logic in event handler without effects (Vercel best practice: rerender-move-effect-to-event)
  const handleBuildingChange = (newBuilding: string) => {
    const firstRoom = locations.find((loc) => loc.building === newBuilding)
    if (firstRoom) {
      onLocationChange(firstRoom.id)
    }
  }

  // Mobile Bottom Sheet state (isolated to the drawer interaction)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [step, setStep] = React.useState<1 | 2>(1)
  const [tempBuilding, setTempBuilding] = React.useState<string>('')
  const [searchQuery, setSearchQuery] = React.useState('')

  const openSheet = () => {
    setTempBuilding(currentBuilding)
    setStep(1)
    setSearchQuery('')
    setIsSheetOpen(true)
  }

  const closeSheet = () => {
    setIsSheetOpen(false)
    setSearchQuery('')
  }

  // Lock body scroll only when modal sheet is open
  React.useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSheetOpen])

  // Search filtered buildings for bottom sheet step 1
  const filteredBuildings = React.useMemo(() => {
    if (!searchQuery.trim()) return uniqueBuildings
    const q = searchQuery.toLowerCase()
    return uniqueBuildings.filter((b) => b.toLowerCase().includes(q))
  }, [uniqueBuildings, searchQuery])

  // Search filtered rooms for bottom sheet step 2
  const roomsForTempBuilding = React.useMemo(() => {
    if (!tempBuilding) return []
    return locations.filter((loc) => loc.building === tempBuilding)
  }, [locations, tempBuilding])

  const filteredRooms = React.useMemo(() => {
    if (!searchQuery.trim()) return roomsForTempBuilding
    const q = searchQuery.toLowerCase()
    return roomsForTempBuilding.filter((r) => {
      const label = [r.floor, r.roomOrArea].filter(Boolean).join(' ').toLowerCase()
      return label.includes(q)
    })
  }, [roomsForTempBuilding, searchQuery])

  const currentRoomLabel = React.useMemo(() => {
    if (!selectedLocation) return 'Belum dipilih'
    return (
      [selectedLocation.floor, selectedLocation.roomOrArea]
        .filter(Boolean)
        .join(' - ') || 'Area Umum / Seluruh Lantai'
    )
  }, [selectedLocation])

  return (
    <div className="space-y-3">
      {/* ========================================================================= */}
      {/* MOBILE TRIGGER CARD (< md)                                               */}
      {/* ========================================================================= */}
      <div className="block md:hidden">
        <button
          type="button"
          onClick={openSheet}
          className="w-full text-left bg-white border-2 border-[#09090B] p-3.5 shadow-[3px_3px_0_0_#09090B] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_#09090B] transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[1px_1px_0_0_#09090B]">
                <MapPin className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black uppercase text-[#09090B] tracking-tight">
                Lokasi Kampus
              </span>
            </div>
            <div className="flex items-center gap-1 bg-[#C4B5FD] border-2 border-[#09090B] px-2 py-0.5 text-[11px] font-bold text-[#09090B] shadow-[1px_1px_0_0_#09090B]">
              <span>Ubah</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </div>
          </div>

          <div className="bg-[#FAF8F5] border-2 border-[#09090B] p-2.5">
            <div className="flex items-center gap-1.5 text-[#09090B] font-extrabold text-xs">
              <Building2 className="w-3.5 h-3.5 text-[#52525B] shrink-0" strokeWidth={2.5} />
              <span className="truncate">{currentBuilding || 'Pilih Gedung'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#52525B] font-medium text-xs mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#52525B] shrink-0" strokeWidth={2.5} />
              <span className="truncate">{currentRoomLabel}</span>
            </div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP 2-COLUMN SELECT (>= md)                                          */}
      {/* ========================================================================= */}
      <div className="hidden md:grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            <span>1. Gedung / Fakultas</span>
          </label>
          <div className="relative">
            <select
              value={currentBuilding}
              onChange={(e) => handleBuildingChange(e.target.value)}
              className="w-full appearance-none bg-white border-2 border-[#09090B] p-2.5 pr-10 text-xs md:text-sm font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B] cursor-pointer"
            >
              {uniqueBuildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 bg-white border-l-2 border-[#09090B]">
              <ChevronDown className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#09090B] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            <span>2. Lantai & Ruangan</span>
          </label>
          <div className="relative">
            <select
              value={selectedLocationId}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full appearance-none bg-white border-2 border-[#09090B] p-2.5 pr-10 text-xs md:text-sm font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B] cursor-pointer"
            >
              {availableRooms.map((room) => {
                const label = [room.floor, room.roomOrArea]
                  .filter(Boolean)
                  .join(' - ')
                return (
                  <option key={room.id} value={room.id}>
                    {label || 'Area Umum / Seluruh Lantai'}
                  </option>
                )
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 bg-white border-l-2 border-[#09090B]">
              <ChevronDown className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAIL SPESIFIK LOKASI (OPSIONAL)                                        */}
      {/* ========================================================================= */}
      <div>
        <label className="block text-xs font-bold uppercase text-[#52525B] mb-1">
          Detail Spesifik Lokasi (Opsional)
        </label>
        <input
          type="text"
          value={locationDetail}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder="Contoh: Toilet pria sayap barat, di sebelah ruang dosen..."
          maxLength={150}
          className="w-full bg-white border-2 border-[#09090B] p-2.5 text-xs md:text-sm text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
        />
      </div>

      {error && (
        <p className="text-xs font-bold text-red-600 font-mono mt-1">
          * {error}
        </p>
      )}

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET MODAL                                                 */}
      {/* ========================================================================= */}
      {isSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-[#09090B]/60 backdrop-blur-xs transition-opacity"
            onClick={closeSheet}
          />

          {/* Bottom Drawer Card */}
          <div className="relative w-full max-h-[85vh] bg-[#FAF8F5] border-t-4 border-x-2 border-[#09090B] shadow-[0_-6px_0_0_#09090B] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Grab Bar Indicator */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-12 h-1.5 bg-[#09090B]/30 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="px-4 pb-3 border-b-2 border-[#09090B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1)
                      setSearchQuery('')
                    }}
                    className="w-8 h-8 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[2px_2px_0_0_#09090B] active:translate-y-[1px] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                  </button>
                )}
                <div>
                  <h3 className="font-extrabold text-sm text-[#09090B]">
                    {step === 1 ? '1. Pilih Gedung / Fakultas' : '2. Pilih Lantai & Ruangan'}
                  </h3>
                  <p className="text-[11px] font-bold text-[#52525B]">
                    {step === 1
                      ? 'Langkah 1 dari 2'
                      : `Gedung: ${tempBuilding}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSheet}
                className="w-8 h-8 border-2 border-[#09090B] bg-white flex items-center justify-center shadow-[2px_2px_0_0_#09090B] active:translate-y-[1px] cursor-pointer"
              >
                <X className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="p-4 pb-2 bg-[#FAF8F5]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    step === 1
                      ? 'Cari gedung atau fakultas...'
                      : 'Cari lantai atau nama ruangan...'
                  }
                  className="w-full bg-white border-2 border-[#09090B] pl-9 pr-3 py-2 text-xs font-bold text-[#09090B] shadow-[2px_2px_0_0_#09090B] focus:outline-none focus:ring-2 focus:ring-[#09090B]"
                />
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-[#52525B]" strokeWidth={2.5} />
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer text-[#52525B]"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Option List */}
            <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2 max-h-[50vh]">
              {step === 1 ? (
                // Step 1: Buildings List
                filteredBuildings.length > 0 ? (
                  filteredBuildings.map((building) => {
                    const isSelected = building === tempBuilding
                    const roomCount = locations.filter(
                      (l) => l.building === building,
                    ).length

                    return (
                      <button
                        key={building}
                        type="button"
                        onClick={() => {
                          setTempBuilding(building)
                          setSearchQuery('')
                          setStep(2)
                        }}
                        className={`w-full text-left border-2 border-[#09090B] p-3 flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D9F99D] shadow-[3px_3px_0_0_#09090B]'
                            : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_0_#09090B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 border-2 border-[#09090B] bg-white flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-[#09090B]">
                              {building}
                            </p>
                            <p className="text-[10px] font-bold text-[#52525B]">
                              {roomCount} titik ruangan terdaftar
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#09090B] shrink-0" strokeWidth={2.5} />
                      </button>
                    )
                  })
                ) : (
                  <div className="border-2 border-dashed border-[#09090B] p-6 text-center bg-white">
                    <p className="text-xs font-bold text-[#52525B]">
                      Tidak ada gedung yang cocok dengan &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )
              ) : (
                // Step 2: Rooms List
                filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const isSelected = room.id === selectedLocationId
                    const label =
                      [room.floor, room.roomOrArea]
                        .filter(Boolean)
                        .join(' - ') || 'Area Umum / Seluruh Lantai'

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          onLocationChange(room.id)
                          closeSheet()
                        }}
                        className={`w-full text-left border-2 border-[#09090B] p-3 flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D9F99D] shadow-[3px_3px_0_0_#09090B]'
                            : 'bg-white hover:bg-neutral-50 shadow-[2px_2px_0_0_#09090B]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 border-2 border-[#09090B] bg-white flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-extrabold text-xs text-[#09090B]">
                              {label}
                            </p>
                            <p className="text-[10px] font-bold text-[#52525B]">
                              {room.campus}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 border-2 border-[#09090B] bg-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })
                ) : (
                  <div className="border-2 border-dashed border-[#09090B] p-6 text-center bg-white">
                    <p className="text-xs font-bold text-[#52525B]">
                      Tidak ada ruangan yang cocok dengan &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Bottom Safe Footer */}
            <div className="p-3 border-t-2 border-[#09090B] bg-white flex justify-between items-center text-[11px] font-bold text-[#52525B]">
              <span>SIPRA-UNTAD Lokasi</span>
              <button
                type="button"
                onClick={closeSheet}
                className="underline hover:text-[#09090B] cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

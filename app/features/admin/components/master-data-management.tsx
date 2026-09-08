import * as React from 'react'
import {
  Tag,
  Building2,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Check,
  X,
  Search,
  AlertCircle,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/lib/utils'
import {
  createCategoryAction,
  updateCategoryAction,
  toggleArchiveCategoryAction,
  createLocationAction,
  updateLocationAction,
  toggleArchiveLocationAction,
} from '../admin.fn'

export interface CategoryItem {
  id: string
  name: string
  isArchived: boolean
  createdAt: Date | string
}

export interface LocationItem {
  id: string
  campus: string
  building: string
  floor?: string | null
  roomOrArea?: string | null
  isArchived: boolean
  createdAt: Date | string
}

interface MasterDataManagementProps {
  initialCategories: CategoryItem[]
  initialLocations: LocationItem[]
  onNotify: (msg: string) => void
}

export function MasterDataManagement({
  initialCategories,
  initialLocations,
  onNotify,
}: MasterDataManagementProps) {
  const [categories, setCategories] = React.useState<CategoryItem[]>(initialCategories)
  const [locations, setLocations] = React.useState<LocationItem[]>(initialLocations)

  // Subtab: 'categories' | 'locations'
  const [activeSubTab, setActiveSubTab] = React.useState<'categories' | 'locations'>('categories')

  // State Form Kategori
  const [newCategoryName, setNewCategoryName] = React.useState('')
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)
  const [categoryError, setCategoryError] = React.useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = React.useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = React.useState('')

  // State Form Lokasi
  const [newCampus, setNewCampus] = React.useState('Bumi Tadulako Tondo')
  const [newBuilding, setNewBuilding] = React.useState('')
  const [newFloor, setNewFloor] = React.useState('')
  const [newRoomOrArea, setNewRoomOrArea] = React.useState('')
  const [isAddingLocation, setIsAddingLocation] = React.useState(false)
  const [locationError, setLocationError] = React.useState<string | null>(null)

  // State Edit Lokasi Modal
  const [editingLocation, setEditingLocation] = React.useState<LocationItem | null>(null)
  const [editCampus, setEditCampus] = React.useState('')
  const [editBuilding, setEditBuilding] = React.useState('')
  const [editFloor, setEditFloor] = React.useState('')
  const [editRoomOrArea, setEditRoomOrArea] = React.useState('')
  const [isUpdatingLocation, setIsUpdatingLocation] = React.useState(false)

  // Filter & Search Lokasi
  const [locationSearch, setLocationSearch] = React.useState('')
  const [locationStatusFilter, setLocationStatusFilter] = React.useState<'all' | 'active' | 'archived'>('all')

  // --- Handlers Kategori ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    setCategoryError(null)
    setIsAddingCategory(true)
    try {
      const added = await createCategoryAction({
        data: { name: newCategoryName.trim() },
      })
      setCategories((prev) => [added, ...prev])
      setNewCategoryName('')
      onNotify(`Kategori "${added.name}" berhasil ditambahkan ke sistem.`)
    } catch (err: unknown) {
      setCategoryError(err instanceof Error ? err.message : 'Gagal menambahkan kategori.')
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategoryId(cat.id)
    setEditingCategoryName(cat.name)
  }

  const handleSaveEditCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return

    try {
      const updated = await updateCategoryAction({
        data: { id, name: editingCategoryName.trim() },
      })
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c)),
      )
      setEditingCategoryId(null)
      onNotify(`Nama kategori diperbarui menjadi "${updated.name}".`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui kategori.')
    }
  }

  const handleToggleArchiveCategory = async (cat: CategoryItem) => {
    const nextArchived = !cat.isArchived
    const confirmText = nextArchived
      ? `Arsipkan kategori "${cat.name}"? Kategori ini tidak akan muncul di form pengaduan baru.`
      : `Aktifkan kembali kategori "${cat.name}"?`

    if (!window.confirm(confirmText)) return

    try {
      const updated = await toggleArchiveCategoryAction({
        data: { id: cat.id, isArchived: nextArchived },
      })
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isArchived: updated.isArchived } : c)),
      )
      onNotify(
        nextArchived
          ? `Kategori "${cat.name}" berhasil diarsipkan.`
          : `Kategori "${cat.name}" berhasil diaktifkan kembali.`,
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status arsip.')
    }
  }

  // --- Handlers Lokasi ---
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBuilding.trim()) return

    setLocationError(null)
    setIsAddingLocation(true)
    try {
      const added = await createLocationAction({
        data: {
          campus: newCampus.trim() || 'Bumi Tadulako Tondo',
          building: newBuilding.trim(),
          floor: newFloor.trim() || null,
          roomOrArea: newRoomOrArea.trim() || null,
        },
      })
      setLocations((prev) => [added, ...prev])
      setNewBuilding('')
      setNewFloor('')
      setNewRoomOrArea('')
      onNotify(`Lokasi gedung "${added.building}" berhasil ditambahkan.`)
    } catch (err: unknown) {
      setLocationError(err instanceof Error ? err.message : 'Gagal menambahkan lokasi.')
    } finally {
      setIsAddingLocation(false)
    }
  }

  const handleStartEditLocation = (loc: LocationItem) => {
    setEditingLocation(loc)
    setEditCampus(loc.campus)
    setEditBuilding(loc.building)
    setEditFloor(loc.floor || '')
    setEditRoomOrArea(loc.roomOrArea || '')
  }

  const handleSaveEditLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLocation || !editBuilding.trim()) return

    setIsUpdatingLocation(true)
    try {
      const updated = await updateLocationAction({
        data: {
          id: editingLocation.id,
          campus: editCampus.trim() || 'Bumi Tadulako Tondo',
          building: editBuilding.trim(),
          floor: editFloor.trim() || null,
          roomOrArea: editRoomOrArea.trim() || null,
        },
      })
      setLocations((prev) =>
        prev.map((l) => (l.id === editingLocation.id ? updated : l)),
      )
      setEditingLocation(null)
      onNotify(`Data lokasi "${updated.building}" berhasil diperbarui.`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memperbarui lokasi.')
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  const handleToggleArchiveLocation = async (loc: LocationItem) => {
    const nextArchived = !loc.isArchived
    const confirmText = nextArchived
      ? `Arsipkan lokasi "${loc.building}"? Lokasi ini tidak akan muncul di form pengaduan baru.`
      : `Aktifkan kembali lokasi "${loc.building}"?`

    if (!window.confirm(confirmText)) return

    try {
      const updated = await toggleArchiveLocationAction({
        data: { id: loc.id, isArchived: nextArchived },
      })
      setLocations((prev) =>
        prev.map((l) => (l.id === loc.id ? { ...l, isArchived: updated.isArchived } : l)),
      )
      onNotify(
        nextArchived
          ? `Lokasi "${loc.building}" berhasil diarsipkan.`
          : `Lokasi "${loc.building}" berhasil diaktifkan kembali.`,
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status arsip lokasi.')
    }
  }

  // Filtered locations
  const filteredLocations = React.useMemo(() => {
    return locations.filter((loc) => {
      if (locationStatusFilter === 'active' && loc.isArchived) return false
      if (locationStatusFilter === 'archived' && !loc.isArchived) return false
      if (locationSearch.trim()) {
        const q = locationSearch.toLowerCase().trim()
        const matchBuilding = loc.building.toLowerCase().includes(q)
        const matchFloor = (loc.floor || '').toLowerCase().includes(q)
        const matchRoom = (loc.roomOrArea || '').toLowerCase().includes(q)
        const matchCampus = loc.campus.toLowerCase().includes(q)
        if (!matchBuilding && !matchFloor && !matchRoom && !matchCampus) {
          return false
        }
      }
      return true
    })
  }, [locations, locationStatusFilter, locationSearch])

  return (
    <div className="space-y-6">
      {/* Subtab Toggle Buttons */}
      <div className="flex items-center gap-2 border-b-2 border-[#09090B] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-[#09090B] text-xs md:text-sm font-extrabold cursor-pointer transition-all ${
            activeSubTab === 'categories'
              ? 'bg-[#BAE6FD] shadow-[4px_4px_0_0_#09090B] translate-x-[-2px] translate-y-[-2px]'
              : 'bg-white hover:bg-[#FAF8F5]'
          }`}
        >
          <Tag className="w-4 h-4" strokeWidth={2.5} />
          <span>Kategori Sarana ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('locations')}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-[#09090B] text-xs md:text-sm font-extrabold cursor-pointer transition-all ${
            activeSubTab === 'locations'
              ? 'bg-[#FEF08A] shadow-[4px_4px_0_0_#09090B] translate-x-[-2px] translate-y-[-2px]'
              : 'bg-white hover:bg-[#FAF8F5]'
          }`}
        >
          <Building2 className="w-4 h-4" strokeWidth={2.5} />
          <span>Lokasi &amp; Gedung Kampus ({locations.length})</span>
        </button>
      </div>

      {/* --- SUBTAB 1: KATEGORI SARANA --- */}
      {activeSubTab === 'categories' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Tambah Kategori */}
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] h-fit space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#09090B]">
              <div className="w-7 h-7 border border-[#09090B] bg-[#BAE6FD] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-sm text-[#09090B]">
                Tambah Kategori Baru
              </h3>
            </div>
            <p className="text-xs text-[#52525B]">
              Kategori baru akan langsung tampil pada pilihan formulir pelaporan sarana prasarana.
            </p>

            {categoryError && (
              <div className="p-2.5 border-2 border-[#09090B] bg-[#FECDD3] text-[#09090B] flex items-start justify-between gap-2 text-xs font-bold shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>{categoryError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryError(null)}
                  className="text-xs font-bold text-[#09090B] hover:text-[#991B1B] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lift &amp; Eskalator"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value)
                    if (categoryError) setCategoryError(null)
                  }}
                  className={`w-full px-3 py-2 text-xs border-2 bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B] ${
                    categoryError ? 'border-[#E11D48]' : 'border-[#09090B]'
                  }`}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isAddingCategory || !newCategoryName.trim()}
                className="w-full"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span>{isAddingCategory ? 'Menyimpan...' : 'Simpan Kategori'}</span>
              </Button>
            </form>
          </div>

          {/* Daftar Kategori */}
          <div className="lg:col-span-2 border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#09090B]">
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                  Daftar Kategori Sarana Prasarana
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  Gunakan arsip untuk menonaktifkan kategori tanpa menghapus histori tiket lama
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 border border-[#09090B] bg-[#FAF8F5]">
                {categories.filter((c) => !c.isArchived).length} Aktif
              </span>
            </div>

            <div className="divide-y border-2 border-[#09090B]">
              {categories.map((cat) => {
                const isEditing = editingCategoryId === cat.id
                return (
                  <div
                    key={cat.id}
                    className={`p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 transition-colors ${
                      cat.isArchived ? 'bg-neutral-100 opacity-70' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className={`w-7 h-7 border border-[#09090B] flex items-center justify-center shrink-0 ${
                          cat.isArchived ? 'bg-neutral-200' : 'bg-[#C4B5FD]'
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5 flex-1 max-w-sm">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="px-2 py-1 text-xs border-2 border-[#09090B] bg-white w-full focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat.id)}
                            className="p-1 border border-[#09090B] bg-[#D9F99D] cursor-pointer"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryId(null)}
                            className="p-1 border border-[#09090B] bg-[#FECDD3] cursor-pointer"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs md:text-sm text-[#09090B] truncate">
                            {cat.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#52525B]">
                            ID: {cat.id} • Dibuat {formatDate(cat.createdAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Badge & Aksi */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] ${
                          cat.isArchived
                            ? 'bg-neutral-300 text-[#52525B]'
                            : 'bg-[#D9F99D] text-[#09090B]'
                        }`}
                      >
                        {cat.isArchived ? 'Diarsipkan' : 'Aktif'}
                      </span>

                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => handleStartEditCategory(cat)}
                          className="p-1.5 border border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[1px_1px_0_0_#09090B] cursor-pointer"
                          title="Ubah Nama Kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleArchiveCategory(cat)}
                        className={`p-1.5 border border-[#09090B] shadow-[1px_1px_0_0_#09090B] cursor-pointer ${
                          cat.isArchived
                            ? 'bg-[#BAE6FD] hover:bg-[#7DD3FC]'
                            : 'bg-[#FECDD3] hover:bg-[#FDA4AF]'
                        }`}
                        title={cat.isArchived ? 'Aktifkan Kembali' : 'Arsipkan Kategori'}
                      >
                        {cat.isArchived ? (
                          <RotateCcw className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                        ) : (
                          <Archive className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* --- SUBTAB 2: LOKASI & GEDUNG KAMPUS --- */}
      {activeSubTab === 'locations' ? (
        <div className="space-y-6">
          {/* Form Tambah Gedung */}
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-[#09090B]">
              <div className="w-7 h-7 border border-[#09090B] bg-[#FEF08A] flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                Tambah Lokasi / Gedung Baru
              </h3>
            </div>

            {locationError && (
              <div className="p-2.5 border-2 border-[#09090B] bg-[#FECDD3] text-[#09090B] flex items-start justify-between gap-2 text-xs font-bold shadow-[2px_2px_0_0_#09090B]">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span>{locationError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLocationError(null)}
                  className="text-xs font-bold text-[#09090B] hover:text-[#991B1B] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Nama Kampus
                </label>
                <input
                  type="text"
                  value={newCampus}
                  onChange={(e) => {
                    setNewCampus(e.target.value)
                    if (locationError) setLocationError(null)
                  }}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Nama Gedung / Fakultas *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung Lab Kimia Terpadu"
                  value={newBuilding}
                  onChange={(e) => {
                    setNewBuilding(e.target.value)
                    if (locationError) setLocationError(null)
                  }}
                  className={`w-full px-3 py-2 text-xs border-2 bg-[#FAF8F5] focus:bg-white focus:outline-none ${
                    locationError ? 'border-[#E11D48]' : 'border-[#09090B]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Lantai (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lantai 2"
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Ruangan / Area (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Lab Komputasi A"
                  value={newRoomOrArea}
                  onChange={(e) => setNewRoomOrArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button
                  type="submit"
                  variant="lime"
                  size="sm"
                  disabled={isAddingLocation || !newBuilding.trim()}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  <span>{isAddingLocation ? 'Menyimpan...' : 'Simpan Lokasi Gedung'}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Tabel Lokasi Gedung */}
          <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b-2 border-[#09090B]">
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                  Daftar Gedung &amp; Lokasi Kampus
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  Seluruh denah gedung terdaftar untuk pemetaan insiden sarana
                </p>
              </div>

              {/* Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
                  <input
                    type="text"
                    placeholder="Cari gedung..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="pl-8 pr-2.5 py-1 text-xs border border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <select
                  value={locationStatusFilter}
                  onChange={(e) => setLocationStatusFilter(e.target.value as any)}
                  className="px-2 py-1 text-xs font-bold border border-[#09090B] bg-white cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Hanya Aktif</option>
                  <option value="archived">Hanya Diarsipkan</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-[#09090B]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b-2 border-[#09090B] font-extrabold uppercase text-[10px] text-[#09090B]">
                    <th className="p-3 border-r border-[#09090B]">Kampus</th>
                    <th className="p-3 border-r border-[#09090B]">Gedung / Fakultas</th>
                    <th className="p-3 border-r border-[#09090B]">Lantai / Ruangan</th>
                    <th className="p-3 border-r border-[#09090B]">Status</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-[#09090B]">
                  {filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs font-bold text-[#52525B]">
                        Tidak ada gedung yang cocok dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((loc) => (
                      <tr
                        key={loc.id}
                        className={`hover:bg-[#FAF8F5] transition-colors ${
                          loc.isArchived ? 'bg-neutral-100 opacity-70' : ''
                        }`}
                      >
                        <td className="p-3 border-r border-[#09090B] font-bold text-[#52525B] whitespace-nowrap">
                          {loc.campus}
                        </td>
                        <td className="p-3 border-r border-[#09090B] font-extrabold text-[#09090B]">
                          {loc.building}
                        </td>
                        <td className="p-3 border-r border-[#09090B] font-mono text-[11px] text-[#52525B]">
                          {[loc.floor, loc.roomOrArea].filter(Boolean).join(' • ') || '-'}
                        </td>
                        <td className="p-3 border-r border-[#09090B] whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] ${
                              loc.isArchived
                                ? 'bg-neutral-300 text-[#52525B]'
                                : 'bg-[#D9F99D] text-[#09090B]'
                            }`}
                          >
                            {loc.isArchived ? 'Diarsipkan' : 'Aktif'}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditLocation(loc)}
                              className="p-1.5 border border-[#09090B] bg-white hover:bg-[#FAF8F5] shadow-[1px_1px_0_0_#09090B] cursor-pointer"
                              title="Ubah Rincian Lokasi"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleArchiveLocation(loc)}
                              className={`p-1.5 border border-[#09090B] shadow-[1px_1px_0_0_#09090B] cursor-pointer ${
                                loc.isArchived
                                  ? 'bg-[#BAE6FD] hover:bg-[#7DD3FC]'
                                  : 'bg-[#FECDD3] hover:bg-[#FDA4AF]'
                              }`}
                              title={loc.isArchived ? 'Aktifkan Kembali' : 'Arsipkan Gedung'}
                            >
                              {loc.isArchived ? (
                                <RotateCcw className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                              ) : (
                                <Archive className="w-3.5 h-3.5 text-[#09090B]" strokeWidth={2.5} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Edit Lokasi */}
      {editingLocation ? (
        <div
          className="fixed inset-0 z-50 bg-[#09090B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingLocation(null)}
        >
          <div
            className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#09090B]">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-sm text-[#09090B]">
                  Ubah Rincian Gedung / Lokasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLocation(null)}
                className="p-1 border border-[#09090B] bg-white hover:bg-[#FECDD3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLocation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Kampus
                </label>
                <input
                  type="text"
                  value={editCampus}
                  onChange={(e) => setEditCampus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Nama Gedung / Fakultas
                </label>
                <input
                  type="text"
                  value={editBuilding}
                  onChange={(e) => setEditBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Lantai
                </label>
                <input
                  type="text"
                  value={editFloor}
                  onChange={(e) => setEditFloor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#09090B] mb-1">
                  Ruangan / Area
                </label>
                <input
                  type="text"
                  value={editRoomOrArea}
                  onChange={(e) => setEditRoomOrArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingLocation(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isUpdatingLocation || !editBuilding.trim()}
                >
                  {isUpdatingLocation ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

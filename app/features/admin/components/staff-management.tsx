import * as React from 'react'
import {
  UserPlus,
  Users,
  Shield,
  KeyRound,
  Wrench,
  BarChart3,
  X,
  Search,
  Sparkles,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { formatDate, formatErrorMessage } from '~/lib/utils'
import {
  createStaffUserAction,
  updateStaffRoleAction,
  resetStaffPasswordAction,
} from '../admin.fn'

export interface StaffUserItem {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date | string
  image?: string | null
}

interface StaffManagementProps {
  initialStaff: StaffUserItem[]
  currentAdminId: string
  onNotify: (msg: string, type?: 'success' | 'error') => void
}

const ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; icon: React.ElementType }
> = {
  admin: {
    label: 'Admin Sarpras',
    bg: 'bg-[#FECDD3]',
    icon: Shield,
  },
  technician: {
    label: 'Teknisi Lapangan',
    bg: 'bg-[#FED7AA]',
    icon: Wrench,
  },
  monitor: {
    label: 'Pemantau Eksekutif',
    bg: 'bg-[#BAE6FD]',
    icon: BarChart3,
  },
  reporter: {
    label: 'Pelapor Sivitas',
    bg: 'bg-[#E2E8F0]',
    icon: Users,
  },
}

export function StaffManagement({
  initialStaff,
  currentAdminId,
  onNotify,
}: StaffManagementProps) {
  const [staffList, setStaffList] = React.useState<StaffUserItem[]>(initialStaff)

  // Form Buat Staf
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<'technician' | 'monitor' | 'admin'>('technician')
  const [password, setPassword] = React.useState('Password123!')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Filter & Search
  const [searchQuery, setSearchQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')

  // Modal Ubah Role
  const [roleModalUser, setRoleModalUser] = React.useState<StaffUserItem | null>(null)
  const [selectedNewRole, setSelectedNewRole] = React.useState<
    'technician' | 'monitor' | 'admin' | 'reporter'
  >('technician')
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false)

  // Modal Reset Password
  const [passwordModalUser, setPasswordModalUser] = React.useState<StaffUserItem | null>(null)
  const [newPasswordInput, setNewPasswordInput] = React.useState('Password123!')
  const [isResettingPassword, setIsResettingPassword] = React.useState(false)

  // Handlers
  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
    let res = ''
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(res)
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return

    setIsSubmitting(true)
    try {
      const created = await createStaffUserAction({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          role,
          password: password.trim(),
        },
      })

      const newStaffItem: StaffUserItem = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        createdAt: new Date(),
      }

      setStaffList((prev) => [newStaffItem, ...prev])
      setName('')
      setEmail('')
      setPassword('Password123!')
      onNotify(`Akun ${ROLE_CONFIG[role].label} atas nama "${created.name}" berhasil dibuat.`)
    } catch (err: unknown) {
      onNotify(formatErrorMessage(err, 'Gagal membuat akun staf.'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenRoleModal = (u: StaffUserItem) => {
    setRoleModalUser(u)
    setSelectedNewRole(
      (u.role as 'technician' | 'monitor' | 'admin' | 'reporter') || 'technician',
    )
  }

  const handleSaveRole = async () => {
    if (!roleModalUser) return
    setIsUpdatingRole(true)
    try {
      const updated = await updateStaffRoleAction({
        data: {
          userId: roleModalUser.id,
          newRole: selectedNewRole,
        },
      })

      setStaffList((prev) =>
        prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: updated.role } : u)),
      )
      setRoleModalUser(null)
      onNotify(`Peran akun "${updated.name}" berhasil diubah menjadi ${ROLE_CONFIG[updated.role]?.label || updated.role}.`)
    } catch (err: unknown) {
      onNotify(formatErrorMessage(err, 'Gagal mengubah peran staf.'), 'error')
    } finally {
      setIsUpdatingRole(false)
    }
  }

  const handleOpenPasswordModal = (u: StaffUserItem) => {
    setPasswordModalUser(u)
    setNewPasswordInput('Password123!')
  }

  const handleSavePassword = async () => {
    if (!passwordModalUser || !newPasswordInput.trim()) return
    setIsResettingPassword(true)
    try {
      await resetStaffPasswordAction({
        data: {
          userId: passwordModalUser.id,
          newPassword: newPasswordInput.trim(),
        },
      })
      const targetName = passwordModalUser.name
      setPasswordModalUser(null)
      onNotify(`Kata sandi akun "${targetName}" berhasil diperbarui.`)
    } catch (err: unknown) {
      onNotify(formatErrorMessage(err, 'Gagal me-reset kata sandi.'), 'error')
    } finally {
      setIsResettingPassword(false)
    }
  }

  // Filter staff list
  const filteredStaff = React.useMemo(() => {
    return staffList.filter((s) => {
      if (roleFilter !== 'all' && s.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchEmail = s.email.toLowerCase().includes(q)
        if (!matchName && !matchEmail) return false
      }
      return true
    })
  }, [staffList, roleFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Grid: Form Pembuatan Akun Staf & Tabel Staf */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Buat Akun Staf Baru */}
        <div className="border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] h-fit space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-[#09090B]">
            <div className="w-8 h-8 border-2 border-[#09090B] bg-[#BAE6FD] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
              <UserPlus className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                Daftarkan Staf Baru
              </h3>
              <p className="text-[10px] text-[#52525B]">
                Registrasi akun operasional kampus
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateStaff} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#09090B] mb-1">
                Nama Lengkap &amp; Jabatan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso (Teknisi)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#09090B] mb-1">
                Alamat Email Resmi *
              </label>
              <input
                type="email"
                placeholder="staf@untad.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#09090B] mb-1">
                Peran / Otoritas Akses *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B] cursor-pointer"
              >
                <option value="technician">Teknisi Lapangan (Pengerjaan &amp; Bukti Fisik)</option>
                <option value="monitor">Pemantau &amp; Pimpinan (Analitik &amp; Audit SLA)</option>
                <option value="admin">Admin Sarpras (Kendali Penuh Sistem)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#09090B]">
                  Kata Sandi Awal *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  className="text-[10px] font-bold text-[#09090B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Acak</span>
                </button>
              </div>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border-2 border-[#09090B] bg-[#FAF8F5] focus:bg-white focus:outline-none shadow-[2px_2px_0_0_#09090B]"
                required
                minLength={8}
              />
              <p className="text-[10px] text-[#52525B] mt-1 font-mono">
                Minimal 8 karakter. Berikan sandi ini kepada staf terkait.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !name.trim() || !email.trim() || !password.trim()}
              className="w-full mt-2"
            >
              <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Akun Staf'}</span>
            </Button>
          </form>
        </div>

        {/* Kolom Kanan: Tabel Daftar Staf Kampus */}
        <div className="lg:col-span-2 border-2 border-[#09090B] bg-white p-5 shadow-[4px_4px_0_0_#09090B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b-2 border-[#09090B]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#09090B] bg-[#D9F99D] flex items-center justify-center shadow-[2px_2px_0_0_#09090B]">
                <Users className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-[#09090B]">
                  Daftar Akun Staf &amp; Pengawas Kampus
                </h3>
                <p className="text-[11px] text-[#52525B]">
                  Total {staffList.length} akun terdaftar dengan hak akses operasional
                </p>
              </div>
            </div>

            {/* Filter Search & Role */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525B]" />
                <input
                  type="text"
                  placeholder="Cari nama / email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-2.5 py-1 text-xs border border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2 py-1 text-xs font-bold border border-[#09090B] bg-white cursor-pointer"
              >
                <option value="all">Semua Peran</option>
                <option value="technician">Teknisi</option>
                <option value="monitor">Pemantau</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Tabel Staf */}
          <div className="overflow-x-auto border-2 border-[#09090B]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b-2 border-[#09090B] font-extrabold uppercase text-[10px] text-[#09090B]">
                  <th className="p-3 border-r border-[#09090B]">Nama &amp; Email Staf</th>
                  <th className="p-3 border-r border-[#09090B]">Peran / Role</th>
                  <th className="p-3 border-r border-[#09090B]">Didaftarkan</th>
                  <th className="p-3 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y border-[#09090B]">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-xs font-bold text-[#52525B]">
                      Tidak ada akun staf yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staf) => {
                    const cfg = ROLE_CONFIG[staf.role] || ROLE_CONFIG.reporter
                    const IconComp = cfg.icon
                    const isSelf = staf.id === currentAdminId

                    return (
                      <tr key={staf.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {/* Nama & Email */}
                        <td className="p-3 border-r border-[#09090B]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 border border-[#09090B] bg-[#C4B5FD] flex items-center justify-center font-black text-xs shrink-0">
                              {staf.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#09090B] flex items-center gap-1.5">
                                <span>{staf.name}</span>
                                {isSelf ? (
                                  <span className="text-[9px] font-mono px-1 border border-[#09090B] bg-[#FEF08A]">
                                    Akun Anda
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] font-mono text-[#52525B]">
                                {staf.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Peran Badge */}
                        <td className="p-3 border-r border-[#09090B] whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase border border-[#09090B] ${cfg.bg} text-[#09090B]`}
                          >
                            <IconComp className="w-3 h-3" strokeWidth={2.5} />
                            <span>{cfg.label}</span>
                          </span>
                        </td>

                        {/* Tanggal Terdaftar */}
                        <td className="p-3 border-r border-[#09090B] font-mono text-[11px] text-[#52525B] whitespace-nowrap">
                          {formatDate(staf.createdAt)}
                        </td>

                        {/* Aksi */}
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenRoleModal(staf)}
                              className="px-2 py-1 text-[11px] font-extrabold border border-[#09090B] bg-white hover:bg-[#FEF08A] shadow-[1px_1px_0_0_#09090B] cursor-pointer"
                              title="Ubah Peran Pengguna"
                            >
                              Ubah Peran
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPasswordModal(staf)}
                              className="px-2 py-1 text-[11px] font-extrabold border border-[#09090B] bg-white hover:bg-[#FECDD3] shadow-[1px_1px_0_0_#09090B] flex items-center gap-1 cursor-pointer"
                              title="Reset Kata Sandi"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Reset Sandi</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ubah Role */}
      {roleModalUser ? (
        <div
          className="fixed inset-0 z-50 bg-[#09090B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRoleModalUser(null)}
        >
          <div
            className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#09090B]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-sm text-[#09090B]">
                  Ubah Peran Akun Staf
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="p-1 border border-[#09090B] bg-white hover:bg-[#FECDD3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#09090B]">
              <div className="font-extrabold text-xs text-[#09090B]">
                {roleModalUser.name}
              </div>
              <div className="text-[11px] font-mono text-[#52525B]">
                {roleModalUser.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#09090B]">
                Pilih Peran Baru:
              </label>

              <div className="space-y-2">
                {[
                  {
                    val: 'technician',
                    label: 'Teknisi Lapangan',
                    desc: 'Menerima penugasan dan mengunggah foto bukti fisik.',
                  },
                  {
                    val: 'monitor',
                    label: 'Pemantau & Pimpinan',
                    desc: 'Melihat dashboard analitik metrik & audit pengaduan.',
                  },
                  {
                    val: 'admin',
                    label: 'Admin Sarpras',
                    desc: 'Akses penuh verifikasi, penugasan, dan kelola data master.',
                  },
                  {
                    val: 'reporter',
                    label: 'Pelapor Sivitas (Non-Staff)',
                    desc: 'Hanya dapat mengajukan dan melacak laporan pribadi.',
                  },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`flex items-start gap-2.5 p-2.5 border-2 border-[#09090B] cursor-pointer transition-colors ${
                      selectedNewRole === item.val ? 'bg-[#BAE6FD]' : 'bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="newRole"
                      value={item.val}
                      checked={selectedNewRole === item.val}
                      onChange={() => setSelectedNewRole(item.val as any)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div>
                      <div className="font-extrabold text-xs text-[#09090B]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#52525B]">
                        {item.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRoleModalUser(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveRole}
                disabled={isUpdatingRole}
              >
                {isUpdatingRole ? 'Menyimpan...' : 'Perbarui Peran'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Reset Password */}
      {passwordModalUser ? (
        <div
          className="fixed inset-0 z-50 bg-[#09090B]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPasswordModalUser(null)}
        >
          <div
            className="w-full max-w-md bg-white border-2 border-[#09090B] shadow-[8px_8px_0_0_#09090B] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#09090B]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#09090B]" strokeWidth={2.5} />
                <h3 className="font-extrabold text-sm text-[#09090B]">
                  Reset Kata Sandi Staf
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 border border-[#09090B] bg-white hover:bg-[#FECDD3] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-[#09090B]">
              <div className="font-extrabold text-xs text-[#09090B]">
                {passwordModalUser.name}
              </div>
              <div className="text-[11px] font-mono text-[#52525B]">
                {passwordModalUser.email}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#09090B]">
                Kata Sandi Baru:
              </label>
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border-2 border-[#09090B] bg-[#FAF8F5] focus:outline-none"
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewPasswordInput('Password123!')}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#09090B] bg-[#FAF8F5] hover:bg-neutral-100 cursor-pointer"
                >
                  Gunakan Password123!
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPasswordModalUser(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleSavePassword}
                disabled={isResettingPassword || newPasswordInput.trim().length < 8}
              >
                {isResettingPassword ? 'Menyimpan...' : 'Konfirmasi Reset Sandi'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

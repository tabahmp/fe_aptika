"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, getBidangs,
} from "@/services/api";
import { api } from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Avatar from "@/components/ui/Avatar";
import {
  Plus, Pencil, Trash2, Search, Filter, Eye, EyeOff,
  UserCog, Wifi, WifiOff, RefreshCw, Users,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  position?: string;
  phone?: string;
  is_active: number;
  bidang_id?: number;
  bidang?: { id: number; name: string; code: string };
}

interface Bidang { id: number; name: string; code: string }

interface ActiveSession {
  token_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  last_used_at: string;
  created_at: string;
}

type TabType = "users" | "sessions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, type = "text", placeholder = "", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60
                   text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-colors shadow-sm"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, children, required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  children: React.ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60
                   text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500/50 transition-colors appearance-none shadow-sm cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: authUser, bidang, isAdminAptika } = useAuthStore();
  const isSuperAdmin =
    isAdminAptika ||
    (authUser?.role === "admin" && (bidang?.code === "APTIKA" || (authUser as any)?.bidang_id === 3));

  const [activeTab, setActiveTab] = useState<TabType>("users");

  // Users State
  const [users, setUsers]     = useState<User[]>([]);
  const [bidangs, setBidangs] = useState<Bidang[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterBidang, setFilterBidang] = useState("");
  const [filterRole, setFilterRole]     = useState("");

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser]     = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<User | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<User | null>(null);

  // Form State
  const [formName, setFormName]         = useState("");
  const [formEmail, setFormEmail]       = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole]         = useState("user");
  const [formBidangId, setFormBidangId] = useState("");
  const [formIsActive, setFormIsActive] = useState("1");
  const [formPosition, setFormPosition] = useState("");
  const [formPhone, setFormPhone]       = useState("");
  const [submitting, setSubmitting]     = useState(false);

  // Active Sessions State
  const [sessions, setSessions]       = useState<ActiveSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [forceLogoutId, setForceLogoutId]     = useState<number | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, bidangsRes] = await Promise.all([
        getAdminUsers(),
        getBidangs(),
      ]);
      setUsers(usersRes.data ?? usersRes);
      setBidangs(bidangsRes.data?.data ?? bidangsRes.data ?? bidangsRes);
    } catch {
      showToast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!isSuperAdmin) return;
    setSessionsLoading(true);
    try {
      const res = await api.get("/admin/active-sessions");
      setSessions(res.data?.data ?? []);
    } catch {
      showToast.error("Gagal memuat sesi aktif.");
    } finally {
      setSessionsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u     = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || u?.role !== "admin") { router.replace("/"); return; }
    fetchUsers();
  }, [fetchUsers, router]);

  useEffect(() => {
    if (activeTab === "sessions") fetchSessions();
  }, [activeTab, fetchSessions]);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch  = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.position ?? "").toLowerCase().includes(q);
    const matchBidang  = !filterBidang || String(u.bidang_id) === filterBidang;
    const matchRole    = !filterRole   || u.role === filterRole;
    return matchSearch && matchBidang && matchRole;
  });

  // ── Form Helpers ───────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingUser(null);
    setFormName(""); setFormEmail(""); setFormPassword("");
    setFormRole("user"); setFormBidangId(""); setFormIsActive("1");
    setFormPosition(""); setFormPhone("");
    setShowFormModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setFormName(u.name); setFormEmail(u.email); setFormPassword("");
    setFormRole(u.role); setFormBidangId(String(u.bidang_id ?? ""));
    setFormIsActive(String(u.is_active)); setFormPosition(u.position ?? "");
    setFormPhone(u.phone ?? "");
    setShowFormModal(true);
  };

  const handleSubmitForm = async () => {
    if (!formName || !formEmail || (!editingUser && !formPassword)) {
      showToast.error("Nama, email, dan kata sandi wajib diisi."); return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, string | number> = {
        name: formName, email: formEmail, role: formRole,
        bidang_id: Number(formBidangId), is_active: Number(formIsActive),
        position: formPosition, phone: formPhone,
      };
      if (formPassword) payload.password = formPassword;

      if (editingUser) {
        await updateAdminUser(editingUser.id, payload as any);
        showToast.success("Data pengguna berhasil diperbarui.");
      } else {
        await createAdminUser(payload as any);
        showToast.success("Akun pengguna baru berhasil dibuat.");
      }
      setShowFormModal(false);
      fetchUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Gagal menyimpan data.";
      showToast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (u: User) => {
    try {
      await deleteAdminUser(u.id);
      showToast.success(`Akun "${u.name}" berhasil dihapus.`);
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      showToast.error("Gagal menghapus pengguna.");
    }
  };

  // ── Impersonate ────────────────────────────────────────────────────────────

  const handleImpersonate = async (u: User) => {
    try {
      const res = await api.post(`/admin/impersonate/${u.id}`);
      const impToken = res.data?.impersonate_token;
      if (!impToken) { showToast.error("Gagal mendapatkan token impersonasi."); return; }

      // Simpan token admin asli & data
      const adminToken = localStorage.getItem("token");
      const adminUser  = localStorage.getItem("user");
      localStorage.setItem("admin_token_backup", adminToken ?? "");
      localStorage.setItem("admin_user_backup", adminUser ?? "");

      // Ganti ke token impersonasi
      localStorage.setItem("token", impToken);
      localStorage.setItem("user", JSON.stringify(res.data.target_user));
      localStorage.setItem("impersonating_user_id", String(u.id));

      showToast.success(`Anda sekarang masuk sebagai ${u.name}`);
      setImpersonateTarget(null);
      router.push("/dashboard");
    } catch {
      showToast.error("Gagal memulai sesi impersonasi.");
    }
  };

  // ── Force Logout ───────────────────────────────────────────────────────────

  const handleForceLogout = async (tokenId: number) => {
    try {
      await api.delete(`/admin/active-sessions/${tokenId}`);
      showToast.success("Sesi pengguna telah diakhiri.");
      fetchSessions();
    } catch {
      showToast.error("Gagal mengakhiri sesi.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Manajemen Pengguna</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isSuperAdmin
            ? "Kelola seluruh akun pengguna dari semua unit kerja."
            : "Kelola akun pengguna di unit kerja Anda."}
        </p>
      </div>

      {/* Tabs (Super Admin only shows sessions tab) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-0">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "users"
              ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Users size={14} />
          Daftar Pengguna
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-px ${
              activeTab === "sessions"
                ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <Wifi size={14} />
            Sesi Aktif
          </button>
        )}
      </div>

      {/* ── TAB: USERS ── */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, email, jabatan..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-red-500/40 shadow-sm"
              />
            </div>

            {/* Filter Bidang */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select
                value={filterBidang} onChange={(e) => setFilterBidang(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-red-500/40 appearance-none shadow-sm cursor-pointer"
              >
                <option value="">Semua Bidang</option>
                {bidangs.map((b) => (
                  <option key={b.id} value={String(b.id)}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Role */}
            <select
              value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-red-500/40 appearance-none shadow-sm cursor-pointer"
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>

            {/* Add Button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-md shadow-red-500/20"
            >
              <Plus size={14} />
              Tambah Pengguna
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-500 bg-slate-50/80 dark:bg-slate-900/30 text-left">
                    {["Pengguna", "Bidang", "Jabatan", "Role", "Status", "Aksi"].map((h) => (
                      <th key={h} className="px-5 py-3.5 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">Memuat data...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-slate-400">Tidak ada pengguna ditemukan.</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</p>
                            <p className="text-slate-500 text-[10px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {u.bidang ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25">
                            {u.bidang.code}
                          </span>
                        ) : <span className="text-slate-400 dark:text-slate-700">—</span>}
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-medium">{u.position || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === "admin"
                            ? "bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/25"
                            : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.is_active
                            ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25"
                            : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/25"
                        }`}>
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all" title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all" title="Hapus">
                            <Trash2 size={13} />
                          </button>
                          {isSuperAdmin && (
                            <button onClick={() => setImpersonateTarget(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all" title="Impersonate">
                              <UserCog size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Menampilkan <span className="text-slate-800 dark:text-slate-400 font-semibold">{filteredUsers.length}</span> dari{" "}
                <span className="text-slate-800 dark:text-slate-400 font-semibold">{users.length}</span> pengguna
              </p>
              <button onClick={fetchUsers} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ACTIVE SESSIONS ── */}
      {activeTab === "sessions" && isSuperAdmin && (
        <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Sesi Login Aktif</h3>
              <p className="text-xs text-slate-500 mt-0.5">Token Sanctum yang sedang aktif untuk seluruh pengguna.</p>
            </div>
            <button onClick={fetchSessions} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm">
              <RefreshCw size={13} className={sessionsLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-500 bg-slate-50/80 dark:bg-slate-900/30 text-left">
                  {["Pengguna", "Email", "Terakhir Aktif", "Login Pada", "Aksi"].map((h) => (
                    <th key={h} className="px-5 py-3.5 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessionsLoading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">Memuat sesi aktif...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <WifiOff size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p>Tidak ada sesi aktif saat ini.</p>
                    </td>
                  </tr>
                ) : sessions.map((s) => (
                  <tr key={s.token_id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Wifi size={12} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-300">{s.user_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">{s.user_email}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {s.last_used_at
                        ? new Date(s.last_used_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Date(s.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setForceLogoutId(s.token_id)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                                   bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all shadow-sm"
                      >
                        <WifiOff size={11} />
                        Force Logout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Form Add/Edit ── */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
             onClick={() => setShowFormModal(false)}>
          <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 transition-colors duration-200"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </h3>

            <InputField label="Nama Lengkap" value={formName} onChange={setFormName} placeholder="Masukkan nama..." required />
            <InputField label="Email" value={formEmail} onChange={setFormEmail} type="email" placeholder="nama@domain.com" required />
            <InputField
              label={editingUser ? "Password Baru (opsional)" : "Password"}
              value={formPassword} onChange={setFormPassword} type="password"
              placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Min 8 karakter"}
              required={!editingUser}
            />
            <InputField label="Jabatan" value={formPosition} onChange={setFormPosition} placeholder="Contoh: Pranata Komputer" />
            <InputField label="No. Telepon" value={formPhone} onChange={setFormPhone} placeholder="08xx..." />

            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Role" value={formRole} onChange={setFormRole} required>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </SelectField>
              <SelectField label="Status Akun" value={formIsActive} onChange={setFormIsActive} required>
                <option value="1">Aktif</option>
                <option value="0">Nonaktif</option>
              </SelectField>
            </div>

            <SelectField label="Unit Kerja / Bidang" value={formBidangId} onChange={setFormBidangId} required>
              <option value="">-- Pilih Bidang --</option>
              {bidangs.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name}</option>
              ))}
            </SelectField>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitForm} disabled={submitting}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 shadow-md shadow-red-500/20"
              >
                {submitting ? "Menyimpan..." : editingUser ? "Simpan Perubahan" : "Buat Akun"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Delete ── */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Hapus Pengguna"
          message={`Anda yakin ingin menghapus akun "${deleteTarget.name}"? Tindakan ini tidak dapat dibatalkan.`}
          onConfirm={() => handleDelete(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          confirmText="Hapus"
          isDanger={true}
        />
      )}

      {/* ── Modal: Confirm Impersonate ── */}
      {impersonateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0b1630] border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 flex items-center justify-center border border-cyan-200 dark:border-transparent">
                <Eye size={18} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Mulai Impersonasi</h3>
                <p className="text-xs text-slate-500">Anda akan masuk sebagai pengguna ini.</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50">
              <p className="text-xs text-slate-700 dark:text-slate-400">
                <span className="font-semibold text-slate-900 dark:text-slate-200">{impersonateTarget.name}</span>{" "}
                ({impersonateTarget.email})
                {impersonateTarget.bidang && ` — Bidang ${impersonateTarget.bidang.name}`}
              </p>
              <p className="text-[10px] text-cyan-600 dark:text-cyan-400/70 mt-1 font-medium">
                Token impersonasi berlaku selama 2 jam. Klik "Admin Panel" di header untuk kembali.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setImpersonateTarget(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleImpersonate(impersonateTarget)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white transition-all shadow-md shadow-cyan-500/20"
              >
                Mulai Impersonasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Force Logout ── */}
      {forceLogoutId !== null && (
        <ConfirmModal
          isOpen={forceLogoutId !== null}
          title="Force Logout Sesi"
          message="Apakah Anda yakin ingin memaksa pengguna ini keluar dari sesi aktif mereka?"
          onConfirm={() => { handleForceLogout(forceLogoutId!); setForceLogoutId(null); }}
          onClose={() => setForceLogoutId(null)}
          confirmText="Force Logout"
          isDanger={true}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  ToggleRight,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
  Clock,
  Monitor,
  User,
  Info,
} from "lucide-react";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  admin_count: number;
  active_services: number;
  total_services: number;
  is_super_admin: boolean;
  per_bidang?: {
    bidang_id: number;
    bidang_name: string;
    bidang_code: string;
    total: number;
    active: number;
    inactive: number;
    admins: number;
  }[];
}

interface AuditEntry {
  id: number;
  action: string;
  description: string;
  ip_address: string;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  causer: { id: number; name: string; email: string } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, string> = {
  create:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  update:         "bg-blue-500/15    text-blue-400    border-blue-500/30",
  delete:         "bg-red-500/15     text-red-400     border-red-500/30",
  toggle:         "bg-purple-500/15  text-purple-400  border-purple-500/30",
  reset_password: "bg-amber-500/15   text-amber-400   border-amber-500/30",
  impersonate:    "bg-cyan-500/15    text-cyan-400    border-cyan-500/30",
  force_logout:   "bg-orange-500/15  text-orange-400  border-orange-500/30",
};

// ─── StatCard Component ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-colors duration-200">
      <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { user, bidang, isAdminAptika, fetchProfile } = useAuthStore();
  
  const isSuperAdmin =
    isAdminAptika ||
    (user?.role === "admin" && (bidang?.code === "APTIKA" || (user as any)?.bidang_id === 3));

  // Stats
  const [stats, setStats]       = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Audit Logs
  const [logs, setLogs]               = useState<AuditEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [lastPage, setLastPage]         = useState(1);
  const [selectedLog, setSelectedLog]   = useState<AuditEntry | null>(null);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: 20,
      };
      if (search)       params.search = search;
      if (actionFilter) params.action = actionFilter;

      const res = await api.get("/admin/audit-logs", { params });
      setLogs(res.data.data);
      setLastPage(res.data.last_page ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  }, [currentPage, search, actionFilter]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [isSuperAdmin, fetchLogs]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Dashboard Admin</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan statistik sistem dan riwayat aktivitas administrator.
        </p>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}      label="Total Pengguna"    value={stats.total_users}    color="text-blue-600 dark:text-blue-400"    bg="bg-blue-50 dark:bg-blue-500/15" />
          <StatCard icon={UserCheck}  label="Pengguna Aktif"    value={stats.active_users}   color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/15" />
          <StatCard icon={UserX}      label="Pengguna Nonaktif" value={stats.inactive_users}  color="text-red-600 dark:text-red-400"     bg="bg-red-50 dark:bg-red-500/15" />
          <StatCard icon={ShieldCheck}label="Total Admin"       value={stats.admin_count}    color="text-violet-600 dark:text-violet-400"  bg="bg-violet-50 dark:bg-violet-500/15" />
          {isSuperAdmin && (
            <div className="col-span-2 lg:col-span-4">
              <StatCard
                icon={ToggleRight}
                label="Layanan Aktif (Global)"
                value={`${stats.active_services} / ${stats.total_services}`}
                color="text-cyan-600 dark:text-cyan-400"
                bg="bg-cyan-50 dark:bg-cyan-500/15"
              />
            </div>
          )}
        </div>
      ) : null}

      {/* Per-Bidang Table (Super Admin Only) */}
      {isSuperAdmin && stats?.per_bidang && (
        <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Statistik Per Bidang</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-500 bg-slate-50/80 dark:bg-slate-900/30 text-left">
                  {["Bidang", "Total", "Aktif", "Nonaktif", "Admin"].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.per_bidang.map((b) => (
                  <tr key={b.bidang_id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-300">{b.bidang_name}</p>
                      <p className="text-slate-500 text-[10px]">{b.bidang_code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 dark:text-slate-300 font-bold">{b.total}</td>
                    <td className="px-5 py-3.5"><span className="text-emerald-600 dark:text-emerald-400 font-semibold">{b.active}</span></td>
                    <td className="px-5 py-3.5"><span className="text-red-600 dark:text-red-400 font-semibold">{b.inactive}</span></td>
                    <td className="px-5 py-3.5"><span className="text-violet-600 dark:text-violet-400 font-semibold">{b.admins}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Log Table (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200">
          {/* Header & Filters */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mr-auto">Audit Trail Log</h3>

            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Cari keterangan..."
                className="pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 w-48 shadow-sm"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
                className="pl-8 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-300 focus:outline-none focus:border-red-500/50 appearance-none shadow-sm cursor-pointer"
              >
                <option value="">Semua Aksi</option>
                {Object.keys(ACTION_STYLES).map((a) => (
                  <option key={a} value={a}>{a.replace(/_/g, " ").toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-500 bg-slate-50/80 dark:bg-slate-900/30 text-left">
                  {["Waktu", "Admin", "Aksi", "Keterangan", "IP Address", ""].map((h, i) => (
                    <th key={i} className="px-5 py-3 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Memuat data...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Belum ada riwayat aktivitas.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/25 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-300">{log.causer?.name ?? "-"}</p>
                        <p className="text-slate-500 text-[10px]">{log.causer?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                            ACTION_STYLES[log.action] ??
                            "bg-slate-500/15 text-slate-500 border-slate-500/30"
                          }`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-400 max-w-xs">
                        <p className="truncate font-medium">{log.description}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-600 font-mono text-[10px]">
                        {log.ip_address}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 text-slate-600 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 hover:border-cyan-400/40 transition-all text-[11px] font-semibold shadow-sm"
                        >
                          <Eye size={12} />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-transparent">
            <span className="text-xs text-slate-500">
              Halaman {currentPage} dari {lastPage}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage >= lastPage}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Bidang notice */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 text-sm text-amber-800 dark:text-amber-400 shadow-sm">
          <p className="font-semibold">Akses Terbatas</p>
          <p className="text-xs mt-1 text-amber-700/80 dark:text-amber-400/70">
            Audit Trail Log dan statistik global hanya tersedia untuk Super Admin (Admin Bidang Aptika).
            Anda dapat mengelola pengguna di bidang Anda melalui menu{" "}
            <a href="/admin/users" className="underline font-semibold">Manajemen Pengguna</a>.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white dark:bg-[#0a1128] border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0b1630]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 flex items-center justify-center border border-cyan-200 dark:border-transparent">
                  <Info size={15} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Detail Log #{selectedLog.id}</h4>
                  <p className="text-[10px] text-slate-500">Riwayat aktivitas administrator</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Waktu */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3">
                  <Clock size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Waktu</p>
                    <p className="text-xs text-slate-800 dark:text-slate-300 font-semibold">
                      {new Date(selectedLog.created_at).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "medium",
                      })}
                    </p>
                  </div>
                </div>

                {/* IP Address */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3">
                  <Monitor size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">IP Address</p>
                    <p className="text-xs text-slate-800 dark:text-slate-300 font-mono font-semibold">
                      {selectedLog.ip_address || "-"}
                    </p>
                  </div>
                </div>

                {/* Admin */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3">
                  <User size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Admin</p>
                    <p className="text-xs text-slate-900 dark:text-white font-bold">{selectedLog.causer?.name ?? "-"}</p>
                    <p className="text-[10px] text-slate-500">{selectedLog.causer?.email ?? ""}</p>
                  </div>
                </div>

                {/* Aksi */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-3.5 flex items-start gap-3">
                  <ShieldCheck size={14} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Jenis Aksi</p>
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${
                        ACTION_STYLES[selectedLog.action] ??
                        "bg-slate-500/15 text-slate-500 border-slate-500/30"
                      }`}
                    >
                      {selectedLog.action.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Keterangan</p>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{selectedLog.description || "-"}</p>
              </div>

              {/* Old Values */}
              {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    Nilai Sebelum Perubahan
                  </p>
                  <pre className="text-xs text-slate-800 dark:text-slate-300 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 overflow-x-auto max-h-48 font-mono leading-relaxed">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {/* New Values */}
              {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    Nilai Sesudah Perubahan
                  </p>
                  <pre className="text-xs text-slate-800 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4 overflow-x-auto max-h-48 font-mono leading-relaxed">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {/* No values notice */}
              {!selectedLog.old_values && !selectedLog.new_values && (
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/40 rounded-xl p-4">
                  <Info size={15} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />
                  <p className="text-xs text-slate-500">
                    Tidak ada data perubahan tersimpan untuk log ini. Aktivitas ini hanya tercatat sebagai log audit tanpa payload perubahan data.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0b1630]">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700/60 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

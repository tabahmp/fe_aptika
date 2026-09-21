"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  FileText,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Layers,
  Building2,
  Lock,
  Globe,
  Users,
  Loader2,
  X,
  FileEdit,
  Download,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmModal from "@/components/ui/ConfirmModal";
import RekamanFormModal from "@/components/smki/RekamanFormModal";
import {
  fetchDaftarRekaman,
  fetchDaftarRekamanLookup,
  createDaftarRekaman,
  updateDaftarRekaman,
  deleteDaftarRekaman,
  downloadDaftarRekamanDocx,
  DaftarRekamanItem,
  HeaderInfo,
  LookupData,
} from "@/services/smki/daftarRekamanService";

// Helper klasifikasi badge class
const getKlasifikasiBadgeClass = (name?: string) => {
  const k = (name || "").toLowerCase();
  if (k.includes("umum")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
  }
  if (k.includes("terbatas")) {
    return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800";
  }
  if (k.includes("sangat rahasia")) {
    return "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800";
  }
  if (k.includes("rahasia")) {
    return "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800";
  }
  return "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800";
};

export default function DaftarRekamanPage() {
  const { user, bidang, isAdminAptika } = useAuthStore();
  const isAdmin = user?.role === "admin" || isAdminAptika;

  // Data List & Stats
  const [items, setItems] = useState<DaftarRekamanItem[]>([]);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    no_dokumen: "FR-003/KOM.03.05/SANDIKAMI",
    no_revisi: "1.0",
    tanggal_berlaku: "14 Oktober 2022",
  });
  const [stats, setStats] = useState({
    total_rekaman: 0,
    total_umum: 0,
    total_terbatas: 0,
    total_pemilik: 0,
  });
  const [loading, setLoading] = useState(true);
  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportNoDokumen, setExportNoDokumen] = useState("FR-003/KOM.03.05/SANDIKAMI");
  const [exportNoRevisi, setExportNoRevisi] = useState("1.0");
  const [exportTanggalBerlaku, setExportTanggalBerlaku] = useState("14 Oktober 2022");

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [klasifikasiId, setKlasifikasiId] = useState<string>("");
  const [retensiId, setRetensiId] = useState<string>("");
  const [pemilikId, setPemilikId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Master Lookup
  const [lookups, setLookups] = useState<LookupData>({
    klasifikasi: [],
    retensi: [],
    pemilik: [],
  });

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DaftarRekamanItem | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DaftarRekamanItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDaftarRekaman({
        search,
        klasifikasi_id: klasifikasiId,
        retensi_id: retensiId,
        pemilik_id: pemilikId,
        page,
        per_page: 10,
      });

      if (res.success) {
        setItems(res.data);
        if (res.header) setHeaderInfo(res.header);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      toast.error("Gagal memuat data rekaman");
    } finally {
      setLoading(false);
    }
  }, [search, klasifikasiId, retensiId, pemilikId, page]);

  const loadLookups = useCallback(async () => {
    try {
      const data = await fetchDaftarRekamanLookup();
      setLookups(data);
    } catch (err) {
      console.error("Gagal memuat lookup rekaman", err);
    }
  }, []);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleOpenExportModal = () => {
    setExportNoDokumen(headerInfo.no_dokumen || "FR-003/KOM.03.05/SANDIKAMI");
    setExportNoRevisi(headerInfo.no_revisi || "1.0");
    setExportTanggalBerlaku(headerInfo.tanggal_berlaku || "14 Oktober 2022");
    setIsExportModalOpen(true);
  };

  const handleDoExport = async () => {
    setExportingDocx(true);
    try {
      const params: any = {
        no_dokumen: exportNoDokumen || undefined,
        no_revisi: exportNoRevisi || undefined,
        tanggal_berlaku: exportTanggalBerlaku || undefined,
      };
      if (search) params.search = search;
      if (klasifikasiId) params.klasifikasi_id = klasifikasiId;
      if (retensiId) params.retensi_id = retensiId;
      if (pemilikId) params.pemilik_id = pemilikId;

      const blob = await downloadDaftarRekamanDocx(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.setAttribute("download", `FR-003_Daftar_Rekaman_${dateStr}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Dokumen FR-003 (.docx) berhasil diunduh!");
      setIsExportModalOpen(false);
    } catch (err: any) {
      toast.error("Gagal mengunduh dokumen FR-003");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: DaftarRekamanItem) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (item: DaftarRekamanItem) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleSaveForm = async (formData: {
    judul: string;
    klasifikasi_id?: number | null;
    retensi_id?: number | null;
    pemilik_id?: number | null;
  }) => {
    if (selectedItem) {
      await updateDaftarRekaman(selectedItem.id, formData);
      toast.success("Data rekaman berhasil diperbarui!");
    } else {
      await createDaftarRekaman(formData);
      toast.success("Data rekaman baru berhasil ditambahkan!");
    }
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDaftarRekaman(itemToDelete.id);
      toast.success("Data rekaman berhasil dihapus!");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (err) {
      toast.error("Gagal menghapus data rekaman");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">

        {/* Hero Banner Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Formulir Daftar Rekaman
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Inventarisasi arsip dokumen dan rekaman informasi SMKI Diskominfo Jawa Barat sesuai ketentuan masa simpan, tingkat klasifikasi keamanan, dan pemilik arsip.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Seksi Sandikami"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Statistics KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Rekaman",
              value: stats.total_rekaman,
              sub: "Terdaftar di formulir FR-003",
              icon: <Layers size={22} />,
              color: "blue",
            },
            {
              label: "Klasifikasi Umum",
              value: stats.total_umum,
              sub: "Dokumen terbuka & publik",
              icon: <Globe size={22} />,
              color: "emerald",
            },
            {
              label: "Terbatas / Rahasia",
              value: stats.total_terbatas,
              sub: "Dokumen akses khusus",
              icon: <Lock size={22} />,
              color: "purple",
            },
            {
              label: "Pemilik Arsip",
              value: stats.total_pemilik,
              sub: "Seksi & bidang pengelola",
              icon: <UserCheck size={22} />,
              color: "amber",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {card.label}
                </p>
                <h3
                  className={`text-2xl font-black text-${card.color}-600 dark:text-${card.color}-400`}
                >
                  {card.value}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-950/60 border border-${card.color}-200/60 dark:border-${card.color}-800/50 flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-400`}
              >
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari judul rekaman, klasifikasi, retensi, atau pemilik..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {(search || klasifikasiId || retensiId || pemilikId) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setKlasifikasiId("");
                    setRetensiId("");
                    setPemilikId("");
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Reset Filter</span>
                </button>
              )}

              <button
                onClick={handleOpenExportModal}
                disabled={exportingDocx}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh daftar rekaman terfilter ke template dokumen FR-003 (.docx)"
              >
                {exportingDocx ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <FileDown size={15} />
                )}
                <span>Ekspor (DOCX)</span>
              </button>

              {isAdmin && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Tambah Rekaman</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Klasifikasi Keamanan:
              </label>
              <select
                value={klasifikasiId}
                onChange={(e) => {
                  setKlasifikasiId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Klasifikasi</option>
                {lookups.klasifikasi.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_klasifikasi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Masa Retensi Dokumen:
              </label>
              <select
                value={retensiId}
                onChange={(e) => {
                  setRetensiId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Retensi</option>
                {lookups.retensi.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_retensi}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Pemilik / Pengelola:
              </label>
              <select
                value={pemilikId}
                onChange={(e) => {
                  setPemilikId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Pemilik</option>
                {lookups.pemilik.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama_pemilik}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={32} className="animate-spin mb-3 text-emerald-600" />
              <p className="text-xs font-semibold">Memuat data rekaman SMKI...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <FileText size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Belum ada data rekaman
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Tidak ditemukan data rekaman yang sesuai dengan filter. Silakan tambahkan data baru atau atur ulang pencarian.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-14 text-center">No</th>
                    <th className="py-3.5 px-4">Judul Rekaman</th>
                    <th className="py-3.5 px-4">Klasifikasi</th>
                    <th className="py-3.5 px-4">Retensi</th>
                    <th className="py-3.5 px-4">Pemilik</th>
                    <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {items.map((item, index) => {
                    const rowNo = (meta.current_page - 1) * meta.per_page + index + 1;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {rowNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                              <FileText size={16} />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {item.judul}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ID: #{item.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getKlasifikasiBadgeClass(
                              item.klasifikasi?.nama_klasifikasi
                            )}`}
                          >
                            <ShieldCheck size={12} />
                            <span>{item.klasifikasi?.nama_klasifikasi || "-"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Clock size={13} className="text-slate-400" />
                            <span>{item.retensi?.nama_retensi || "-"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Users size={13} className="text-slate-400" />
                            <span>{item.pemilik?.nama_pemilik || "-"}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                                title="Edit Data Rekaman"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(item)}
                                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                                title="Hapus Data Rekaman"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-xs text-slate-500 font-medium">
                Menampilkan {items.length} dari {meta.total} data rekaman
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                  Halaman {meta.current_page} dari {meta.last_page}
                </span>
                <button
                  disabled={page === meta.last_page}
                  onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Tambah/Edit */}
      <RekamanFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
        initialData={selectedItem}
        lookup={lookups}
      />

      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Rekaman"
        message={`Apakah Anda yakin ingin menghapus data rekaman "${itemToDelete?.judul}"? Data yang terhapus tidak dapat dikembalikan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDanger={true}
        loading={deleteLoading}
      />

      {/* Modal Ekspor DOCX FR-003 */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileEdit size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Detail Dokumen FR-003</h3>
                  <p className="text-[11px] text-teal-100">Isi informasi header sebelum ekspor</p>
                </div>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-200">
                <strong>Informasi ini akan terisi pada header tabel dokumen Word.</strong>
                <br />
                Kosongkan jika ingin menggunakan nilai default dari template FR-003.
              </div>

              {/* No Dokumen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  No. Dokumen
                </label>
                <input
                  type="text"
                  value={exportNoDokumen}
                  onChange={(e) => setExportNoDokumen(e.target.value)}
                  placeholder="FR-003/KOM.03.05/SANDIKAMI"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 dark:text-white"
                />
              </div>

              {/* No Revisi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  No. Revisi
                </label>
                <input
                  type="text"
                  value={exportNoRevisi}
                  onChange={(e) => setExportNoRevisi(e.target.value)}
                  placeholder="1.0"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 dark:text-white"
                />
              </div>

              {/* Tanggal Berlaku */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Tanggal Berlaku
                </label>
                <input
                  type="text"
                  value={exportTanggalBerlaku}
                  onChange={(e) => setExportTanggalBerlaku(e.target.value)}
                  placeholder="14 Oktober 2022"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 dark:text-white"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  disabled={exportingDocx}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDoExport}
                  disabled={exportingDocx}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {exportingDocx ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>Unduh Dokumen (.docx)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ServiceRouteGuard>
  );
}

"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Box,
  Layers,
  Loader2,
  RotateCcw,
  Building2,
  FileSpreadsheet,
  Monitor,
  Laptop,
  Cpu,
  AlertCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getDaftarAsetTiList,
  getDaftarAsetTiLookup,
  createDaftarAsetTi,
  updateDaftarAsetTi,
  deleteDaftarAsetTi,
  exportDaftarAsetTiExcel,
  DaftarAsetTiItem,
  DaftarAsetTiLookupData,
} from "@/services/api";
import AssetFormModal from "@/components/daftar-aset-ti/AssetFormModal";
import AssetDetailModal from "@/components/daftar-aset-ti/AssetDetailModal";
import AssetDeleteModal from "@/components/daftar-aset-ti/AssetDeleteModal";
import AssetExportModal from "@/components/daftar-aset-ti/AssetExportModal";

// Helper kategori pill badges
const getCategoryBadgeClass = (kategoriName?: string) => {
  const kat = (kategoriName || "").toUpperCase();
  if (kat.includes("PC") || kat.includes("MONITOR")) {
    return "bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800";
  }
  if (kat.includes("LAPTOP") || kat.includes("NOTE")) {
    return "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800";
  }
  if (kat.includes("NETWORK") || kat.includes("ROUTER") || kat.includes("SWITCH")) {
    return "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800";
  }
  if (kat.includes("POWER") || kat.includes("UPS")) {
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700";
  }
  if (kat.includes("SCANNER") || kat.includes("CAM")) {
    return "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
  }
  if (kat.includes("PRINTER")) {
    return "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
};

export default function DaftarAsetTiPage() {
  const { bidang } = useAuthStore();

  // State data utama
  const [items, setItems] = useState<DaftarAsetTiItem[]>([]);
  const [stats, setStats] = useState({
    total_aset: 0,
    total_pc: 0,
    total_laptop: 0,
    total_peripheral: 0,
  });
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedLocation, setSelectedLocation] = useState("Lokasi Aset");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 1,
    to: 10,
  });

  // Master Lookups
  const [lookups, setLookups] = useState<DaftarAsetTiLookupData>({
    kategoris: [],
    klasifikasis: [],
    jeniss: [],
    mereks: [],
    tipes: [],
    penyedias: [],
    penanggung_jawabs: [],
    lokasis: [],
  });

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DaftarAsetTiItem | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailAsset, setSelectedDetailAsset] = useState<DaftarAsetTiItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<DaftarAsetTiItem | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Lookups
  const fetchLookupData = async () => {
    try {
      const res = await getDaftarAsetTiLookup();
      if (res?.success && res?.data) {
        setLookups(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat master data aset:", err);
    }
  };

  // Fetch Asset List
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== "Semua Kategori") {
        params.kategori = selectedCategory;
      }
      if (selectedLocation && selectedLocation !== "Lokasi Aset" && selectedLocation !== "Semua Lokasi") {
        params.lokasi = selectedLocation;
      }

      const res = await getDaftarAsetTiList(params);
      if (res?.success) {
        setItems(res.data || []);
        if (res.stats) {
          setStats({
            total_aset: res.stats.total_aset ?? 0,
            total_pc: res.stats.total_pc ?? 0,
            total_laptop: res.stats.total_laptop ?? 0,
            total_peripheral: res.stats.total_peripheral ?? 0,
          });
        }
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err: any) {
      console.error("Gagal memuat daftar aset:", err);
      toast.error("Gagal memuat daftar aset TI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookupData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search, selectedCategory, selectedLocation]);

  // Handlers
  const handleResetFilter = () => {
    setSearch("");
    setSelectedCategory("Semua Kategori");
    setSelectedLocation("Lokasi Aset");
    setPage(1);
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (item: DaftarAsetTiItem) => {
    setEditingAsset(item);
    setFormModalOpen(true);
  };

  const handleOpenDetail = (item: DaftarAsetTiItem) => {
    setSelectedDetailAsset(item);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (item: DaftarAsetTiItem) => {
    setAssetToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleSaveAsset = async (formData: any) => {
    setActionLoading(true);
    try {
      if (editingAsset) {
        await updateDaftarAsetTi(editingAsset.id, formData);
        toast.success("Data aset berhasil diperbarui");
      } else {
        await createDaftarAsetTi(formData);
        toast.success("Data aset baru berhasil ditambahkan");
      }
      setFormModalOpen(false);
      setEditingAsset(null);
      fetchAssets();
      fetchLookupData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan data aset");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    setActionLoading(true);
    try {
      await deleteDaftarAsetTi(assetToDelete.id);
      toast.success("Data aset berhasil dihapus");
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      fetchAssets();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Gagal menghapus data aset");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteExport = async (options: {
    export_mode: "all" | "filtered";
    date_from?: string;
    date_to?: string;
  }) => {
    setExportLoading(true);
    try {
      const params: any = {
        export_mode: options.export_mode,
      };

      if (options.export_mode === "filtered") {
        if (search.trim()) params.search = search.trim();
        if (selectedCategory && selectedCategory !== "Semua Kategori") {
          params.kategori = selectedCategory;
        }
        if (selectedLocation && selectedLocation !== "Lokasi Aset" && selectedLocation !== "Semua Lokasi") {
          params.lokasi = selectedLocation;
        }
        if (options.date_from) params.date_from = options.date_from;
        if (options.date_to) params.date_to = options.date_to;
      }

      const blobData = await exportDaftarAsetTiExcel(params);
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Daftar_Aset_TI_Bidang_APTIKA_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Berkas Excel berhasil diekspor");
      setExportModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mengekspor data ke Excel");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* 1. Hero Banner matching Software Standar */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Daftar Aset Teknologi Informasi
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Inventarisasi, pengelolaan spesifikasi teknis, pemanfaatan, dan monitoring aset perangkat keras teknologi informasi di lingkungan Diskominfo Jawa Barat.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Bidang Aplikasi Informatika"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileSpreadsheet size={16} className="text-teal-200" />
                <span>Format Export: <strong className="text-teal-100">Microsoft Excel (.xlsx)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 4 KPI / Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Aset TI",
              value: stats.total_aset || meta.total || 0,
              sub: "Terdaftar di katalog inventaris",
              icon: <Layers size={22} />,
              color: "blue" as const,
            },
            {
              label: "PC & Workstation",
              value: stats.total_pc || 0,
              sub: "Unit desktop & All-in-One",
              icon: <Monitor size={22} />,
              color: "blue" as const,
            },
            {
              label: "Laptop & Notebook",
              value: stats.total_laptop || 0,
              sub: "Perangkat kerja mobile",
              icon: <Laptop size={22} />,
              color: "emerald" as const,
            },
            {
              label: "Periferal & Jaringan",
              value: stats.total_peripheral || 0,
              sub: "Kamera, router, printer & display",
              icon: <Cpu size={22} />,
              color: "purple" as const,
            },
          ].map((card, i) => {
            const colors = {
              blue: {
                text: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-950/60",
                border: "border-blue-200/60 dark:border-blue-800/50",
              },
              emerald: {
                text: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-950/60",
                border: "border-emerald-200/60 dark:border-emerald-800/50",
              },
              purple: {
                text: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-950/60",
                border: "border-purple-200/60 dark:border-purple-800/50",
              },
            }[card.color];

            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {card.label}
                  </p>
                  <h3 className={`text-2xl font-black ${colors.text}`}>{card.value}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.text}`}
                >
                  {card.icon}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Toolbar: Search, Filters & Action Buttons */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama aset, kode, serial number, merek, PJ, lokasi..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setExportModalOpen(true)}
                disabled={exportLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh daftar aset terfilter ke file format Excel (.xlsx)"
              >
                {exportLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={15} />
                )}
                <span>Ekspor (Excel)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Aset</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Kategori Aset:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {lookups.kategoris.map((k) => (
                  <option key={k.id} value={k.nama_kategori}>
                    {k.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Lokasi Aset:
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="Lokasi Aset">Semua Lokasi</option>
                <option value="Semua Lokasi">Semua Lokasi</option>
                {lookups.lokasis.map((lok, idx) => (
                  <option key={idx} value={lok}>
                    {lok}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilter}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Data Table Container */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header Info */}
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              Daftar Aset Teknologi Informasi SMKI
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan {items.length} dari {meta.total} data inventaris
            </span>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 min-w-[240px]">NAMA ASET</th>
                  <th className="py-3 px-4 min-w-[130px]">KATEGORI</th>
                  <th className="py-3 px-4 min-w-[190px]">MEREK / TIPE</th>
                  <th className="py-3 px-4 min-w-[140px]">PENYEDIA</th>
                  <th className="py-3 px-4 min-w-[170px]">LOKASI</th>
                  <th className="py-3 px-4 min-w-[160px]">PENANGGUNG JAWAB</th>
                  <th className="py-3 px-4 text-center w-20">DETAIL</th>
                  <th className="py-3 px-4 text-center w-24">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                        <span className="font-medium text-xs">Memuat data inventaris aset...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <AlertCircle size={32} className="text-amber-500 mb-1" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          Data Aset Tidak Ditemukan
                        </span>
                        <p className="text-xs text-slate-400 text-center">
                          Tidak ada data aset yang cocok dengan filter atau kata kunci saat ini.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilter}
                          className="mt-2 text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Bersihkan Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const rowNumber = (meta.current_page - 1) * meta.per_page + (idx + 1);
                    const kategoriName = item.kategori?.nama_kategori || "PC/Monitor";
                    const merekName = item.merek?.nama_merek || "-";
                    const tipeName = item.tipe?.nama_tipe || "";
                    const penyediaName = item.penyedia?.nama_penyedia || "-";
                    const pjName = item.penanggung_jawab?.nama_pj || "-";

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* NO: circular emerald badge */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="flex justify-center">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* NAMA ASET & KODE */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-tight">
                            {item.nama_aset}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                            {item.kode || "-"}
                          </div>
                        </td>

                        {/* KATEGORI BADGE */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${getCategoryBadgeClass(
                              kategoriName
                            )}`}
                          >
                            {kategoriName}
                          </span>
                        </td>

                        {/* MEREK / TIPE */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {merekName}
                          </div>
                          {tipeName && (
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {tipeName}
                            </div>
                          )}
                        </td>

                        {/* PENYEDIA */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                          {penyediaName}
                        </td>

                        {/* LOKASI */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          {item.lokasi || "-"}
                        </td>

                        {/* PENANGGUNG JAWAB */}
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {pjName}
                        </td>

                        {/* DETAIL BUTTON */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            title="Lihat Detail Aset"
                            className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/80 dark:border-teal-800/60 transition-all cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                        </td>

                        {/* AKSI BUTTONS (Edit & Delete) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              title="Ubah Data Aset"
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              title="Hapus Aset"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/80 dark:border-rose-800/60 transition-all cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Controls matching Software Standar */}
          <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Halaman {meta.current_page} dari {meta.last_page || 1}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={meta.current_page <= 1 || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {meta.last_page > 1 &&
                Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setPage(pg)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pg === meta.current_page
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={meta.current_page >= meta.last_page || loading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        {/* Modals - Unchanged */}
        <AssetFormModal
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingAsset(null);
          }}
          onSubmit={handleSaveAsset}
          initialData={editingAsset}
          lookups={lookups}
          loading={actionLoading}
        />

        <AssetDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedDetailAsset(null);
          }}
          asset={selectedDetailAsset}
        />

        <AssetDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setAssetToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          loading={actionLoading}
        />

        <AssetExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          onExport={handleExecuteExport}
          loading={exportLoading}
        />
      </div>
    </ServiceRouteGuard>
  );
}

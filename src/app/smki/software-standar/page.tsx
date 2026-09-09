"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  Download,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Layers,
  Building2,
  Key,
  Globe,
  Cpu,
  Loader2,
  AlertCircle,
  FileDown,
  X,
  Laptop,
  Hash,
  ChevronDown,
  ChevronUp,
  Settings2,
  FileEdit,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getSmkiSoftwareStandarList,
  getSmkiSoftwareStandarLookup,
  createSmkiSoftwareStandar,
  updateSmkiSoftwareStandar,
  deleteSmkiSoftwareStandar,
  downloadSmkiSoftwareStandarDocx,
  SmkiSoftwareItem,
} from "@/services/api";

interface LookupData {
  kategoris: { id: number; nama_kategori: string; keterangan?: string }[];
  tipe_softwares: { id: number; nama_tipe_software: string; keterangan?: string }[];
  penyedia_barangs: { id: number; nama_penyedia_barang: string; kontak_vendor?: string }[];
  nomor_terpakai?: number[];
}

// Grup item berdasarkan nomor_kelompok (atau auto-increment jika null)
function buildGroups(items: SmkiSoftwareItem[]) {
  const groups: { nomor: number | null; items: SmkiSoftwareItem[] }[] = [];
  const seen = new Map<number, number>(); // nomor_kelompok → index in groups
  let autoIdx = 0;

  for (const item of items) {
    const k = item.nomor_kelompok ?? null;
    if (k !== null && seen.has(k)) {
      groups[seen.get(k)!].items.push(item);
    } else {
      const idx = groups.length;
      if (k !== null) seen.set(k, idx);
      groups.push({ nomor: k, items: [item] });
      autoIdx++;
    }
  }
  return groups;
}

export default function SmkiSoftwareStandarPage() {
  const router = useRouter();
  const { user, bidang } = useAuthStore();

  // State List & Data
  const [items, setItems] = useState<SmkiSoftwareItem[]>([]);
  const [stats, setStats] = useState({
    total_software: 0,
    total_lisensi: 0,
    total_opensource: 0,
    total_inhouse: 0,
    total_vendor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [downloadingItemId, setDownloadingItemId] = useState<number | null>(null);

  // Pagination & Filters
  const [search, setSearch] = useState("");
  const [kategoriId, setKategoriId] = useState<string>("");
  const [tipeSoftwareId, setTipeSoftwareId] = useState<string>("");
  const [penyediaBarangId, setPenyediaBarangId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Master Lookup
  const [lookups, setLookups] = useState<LookupData>({
    kategoris: [],
    tipe_softwares: [],
    penyedia_barangs: [],
    nomor_terpakai: [],
  });

  // Opsi fallback acuan standar jika lookup sedang dimuat atau database baru
  const defaultKategoris = [
    { id: 1, nama_kategori: "Lisensi", keterangan: "Software berbayar/lisensi komersial resmi" },
    { id: 2, nama_kategori: "Open source", keterangan: "Software sumber terbuka dengan lisensi publik" },
    { id: 3, nama_kategori: "In house", keterangan: "Software/aplikasi mandiri hasil pengembangan internal" },
  ];

  const defaultTipes = [
    { id: 1, nama_tipe_software: "Operating System" },
    { id: 2, nama_tipe_software: "Aplikasi perkantoran" },
    { id: 3, nama_tipe_software: "Web Application" },
    { id: 4, nama_tipe_software: "Desktop Application" },
    { id: 5, nama_tipe_software: "Browser" },
    { id: 6, nama_tipe_software: "Development Tool" },
    { id: 7, nama_tipe_software: "Communication" },
    { id: 8, nama_tipe_software: "Security & Antivirus" },
    { id: 9, nama_tipe_software: "System Software" },
    { id: 10, nama_tipe_software: "Database Management" },
    { id: 11, nama_tipe_software: "Design & Multimedia" },
  ];

  const availableKategoris = lookups.kategoris && lookups.kategoris.length > 0 ? lookups.kategoris : defaultKategoris;
  const availableTipes = lookups.tipe_softwares && lookups.tipe_softwares.length > 0 ? lookups.tipe_softwares : defaultTipes;

  // ============================================================
  // MODAL FORM: Tambah / Edit Software
  // ============================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SmkiSoftwareItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Nomor kelompok (untuk add/edit)
  const [formNomorKelompok, setFormNomorKelompok] = useState<number | "">("");
  const [isNewKelompok, setIsNewKelompok] = useState(true); // true = buat nomor baru, false = pilih dari existing

  // Form Fields
  const [formNama, setFormNama] = useState("");
  const [formVersi, setFormVersi] = useState("");

  // Kategori Software (dropdown)
  const [formKategoriId, setFormKategoriId] = useState<number | "">("");

  // Tipe Software (pilih dropdown atau input baru)
  const [formTipeId, setFormTipeId] = useState<number | "">("");
  const [isCustomTipe, setIsCustomTipe] = useState(false);
  const [formTipeBaru, setFormTipeBaru] = useState("");

  // Penyedia / Vendor (pilih dropdown atau input baru)
  const [formPenyediaId, setFormPenyediaId] = useState<number | "">("");
  const [isCustomVendor, setIsCustomVendor] = useState(false);
  const [formPenyediaBaru, setFormPenyediaBaru] = useState("");

  const [formKeterangan, setFormKeterangan] = useState("");

  // ============================================================
  // MODAL EXPORT DOCX: Input metadata header dokumen
  // ============================================================
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportMode, setExportMode] = useState<"all" | "single">("all");
  const [exportSingleId, setExportSingleId] = useState<number | null>(null);
  const [exportNoDokumen, setExportNoDokumen] = useState("FR-017/KOM.03.05/ SANDIKAMI");
  const [exportNoRevisi, setExportNoRevisi] = useState("1.0");
  const [exportTanggalBerlaku, setExportTanggalBerlaku] = useState("07 Juli 2022");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SmkiSoftwareItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Lookups
  const fetchLookups = async () => {
    try {
      const res = await getSmkiSoftwareStandarLookup();
      if (res?.success) {
        setLookups(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat master lookup", err);
    }
  };

  // Fetch Software List
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getSmkiSoftwareStandarList({
        search: search || undefined,
        kategori_id: kategoriId || undefined,
        tipe_software_id: tipeSoftwareId || undefined,
        penyedia_barang_id: penyediaBarangId || undefined,
        page,
        per_page: 10,
      });

      if (res?.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal memuat daftar software standar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLookups(); }, []);
  useEffect(() => {
    const timer = setTimeout(() => { fetchList(); }, 250);
    return () => clearTimeout(timer);
  }, [search, kategoriId, tipeSoftwareId, penyediaBarangId, page]);

  // Reset Filter
  const handleResetFilter = () => {
    setSearch("");
    setKategoriId("");
    setTipeSoftwareId("");
    setPenyediaBarangId("");
    setPage(1);
  };

  // Download Docx Helper
  const triggerDocxBlobDownload = (blobData: any, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Buka modal ekspor (semua / filter)
  const handleOpenExportModal = (mode: "all" | "single" = "all", itemId?: number) => {
    setExportMode(mode);
    setExportSingleId(itemId ?? null);
    setIsExportModalOpen(true);
  };

  // Eksekusi ekspor DOCX setelah user mengisi metadata
  const handleDoExport = async () => {
    setDownloadingDocx(true);
    try {
      const params: any = {
        no_dokumen: exportNoDokumen || undefined,
        no_revisi: exportNoRevisi || undefined,
        tanggal_berlaku: exportTanggalBerlaku || undefined,
      };

      if (exportMode === "single" && exportSingleId) {
        params.id = exportSingleId;
      } else {
        if (search) params.search = search;
        if (kategoriId) params.kategori_id = kategoriId;
        if (tipeSoftwareId) params.tipe_software_id = tipeSoftwareId;
        if (penyediaBarangId) params.penyedia_barang_id = penyediaBarangId;
      }

      const blob = await downloadSmkiSoftwareStandarDocx(params);
      const dateStr = new Date().toISOString().slice(0, 10);
      triggerDocxBlobDownload(blob, `FR-017_Daftar_Software_Standar_${dateStr}.docx`);
      toast.success("Dokumen FR-017 (DOCX) berhasil diunduh!");
      setIsExportModalOpen(false);
    } catch (err: any) {
      let errMsg = "Gagal mengunduh dokumen template FR-017";
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) errMsg = json.message;
        } catch (_) { }
      } else if (err?.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      toast.error(errMsg);
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Hitung nomor kelompok berikutnya yang tersedia
  const getNextNomorKelompok = () => {
    const existing = lookups.nomor_terpakai ?? [];
    if (existing.length === 0) return 1;
    return Math.max(...existing) + 1;
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsNewKelompok(true);
    setFormNomorKelompok(getNextNomorKelompok());
    setFormNama("");
    setFormVersi("");
    setFormKategoriId(availableKategoris[0]?.id || 1);
    setIsCustomTipe(false);
    setFormTipeBaru("");
    setFormTipeId(availableTipes[0]?.id || 1);
    setFormPenyediaId("");
    setIsCustomVendor(false);
    setFormPenyediaBaru("");
    setFormKeterangan("");
    setIsModalOpen(true);
  };

  // Open "Tambah ke kelompok yang sama" Modal
  const handleOpenAddToGroupModal = (nomorKelompok: number, referenceItem: SmkiSoftwareItem) => {
    setIsEditMode(false);
    setSelectedItem(null);
    setIsNewKelompok(false);
    setFormNomorKelompok(nomorKelompok);
    setFormNama(referenceItem.nama_software || "");
    setFormVersi("");
    setFormKategoriId(referenceItem.kategori_id || availableKategoris[0]?.id || 1);
    setIsCustomTipe(false);
    setFormTipeBaru("");
    setFormTipeId(referenceItem.tipe_software_id || availableTipes[0]?.id || 1);
    setFormPenyediaId(referenceItem.penyedia_barang_id || "");
    setIsCustomVendor(false);
    setFormPenyediaBaru("");
    setFormKeterangan("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: SmkiSoftwareItem) => {
    setIsEditMode(true);
    setSelectedItem(item);
    setIsNewKelompok(item.nomor_kelompok === null || item.nomor_kelompok === undefined);
    setFormNomorKelompok(item.nomor_kelompok ?? "");
    setFormNama(item.nama_software || "");
    setFormVersi(item.versi || "");
    setFormKategoriId(item.kategori_id || availableKategoris[0]?.id || 1);
    setIsCustomTipe(false);
    setFormTipeBaru("");
    setFormTipeId(item.tipe_software_id || availableTipes[0]?.id || 1);
    setFormPenyediaId(item.penyedia_barang_id || "");
    setIsCustomVendor(false);
    setFormPenyediaBaru("");
    setFormKeterangan(item.keterangan || "");
    setIsModalOpen(true);
  };

  // Submit Modal Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNama.trim()) { toast.error("Nama software wajib diisi!"); return; }
    if (!formVersi.trim()) { toast.error("Versi software wajib diisi!"); return; }
    if (!formKategoriId) {
      toast.error("Kategori software wajib dipilih!");
      return;
    }
    if (isCustomTipe && !formTipeBaru.trim()) {
      toast.error("Nama tipe software baru wajib diisi jika memilih opsi tipe baru!");
      return;
    }
    if (!isCustomTipe && !formTipeId) {
      toast.error("Tipe software wajib dipilih!");
      return;
    }
    if (isCustomVendor && !formPenyediaBaru.trim()) {
      toast.error("Nama penyedia baru wajib diisi jika memilih opsi vendor baru!");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        nomor_kelompok: formNomorKelompok !== "" ? Number(formNomorKelompok) : null,
        nama_software: formNama.trim(),
        versi: formVersi.trim(),
        kategori_id: Number(formKategoriId),
        tipe_software_id: isCustomTipe ? null : formTipeId ? Number(formTipeId) : null,
        tipe_software_baru: isCustomTipe ? formTipeBaru.trim() : undefined,
        penyedia_barang_id: isCustomVendor ? null : formPenyediaId ? Number(formPenyediaId) : null,
        penyedia_baru: isCustomVendor ? formPenyediaBaru.trim() : undefined,
        keterangan: formKeterangan.trim() || undefined,
      };

      if (isEditMode && selectedItem) {
        const res = await updateSmkiSoftwareStandar(selectedItem.id, payload);
        toast.success(res?.message || "Data software berhasil diperbarui!");
      } else {
        const res = await createSmkiSoftwareStandar(payload);
        toast.success(res?.message || "Software standar berhasil ditambahkan!");
      }

      setIsModalOpen(false);
      await fetchList();
      await fetchLookups();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan data software standar");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (item: SmkiSoftwareItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteSmkiSoftwareStandar(itemToDelete.id);
      toast.success("Software berhasil dihapus dari daftar standar.");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await fetchList();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // Helper badge kategori
  const getKategoriBadge = (kategoriName?: string) => {
    const val = (kategoriName || "").toLowerCase();
    if (val.includes("lisensi")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
          <Key size={12} className="text-blue-600 dark:text-blue-400" />
          <span>Lisensi</span>
        </span>
      );
    }
    if (val.includes("open source")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
          <Globe size={12} className="text-emerald-600 dark:text-emerald-400" />
          <span>Open Source</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
        <Cpu size={12} className="text-purple-600 dark:text-purple-400" />
        <span>In House</span>
      </span>
    );
  };

  // Build grouped data for rendering
  const groups = buildGroups(items);

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Manajemen Daftar Software Standar
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Inventarisasi dan verifikasi perangkat lunak resmi organisasi untuk menjamin keamanan informasi, kepatuhan lisensi, dan standarisasi operasional di lingkungan Diskominfo Jawa Barat.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileText size={16} className="text-teal-200" />
                <span>Format Export: <strong className="text-teal-100">Microsoft Word (.docx)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPI / Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Software Standar", value: stats.total_software, sub: "Terdaftar di katalog SMKI", icon: <Layers size={22} />, color: "blue" },
            { label: "Lisensi Komersial", value: stats.total_lisensi, sub: "Berbayar resmi & terverifikasi", icon: <Key size={22} />, color: "blue" },
            { label: "Open Source", value: stats.total_opensource, sub: "Lisensi terbuka & bebas pakai", icon: <Globe size={22} />, color: "emerald" },
            { label: "In-House Diskominfo", value: stats.total_inhouse, sub: "Pengembangan mandiri Jabar", icon: <Cpu size={22} />, color: "purple" },
          ].map((card, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
                <h3 className={`text-2xl font-black text-${card.color}-600 dark:text-${card.color}-400`}>{card.value}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{card.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-950/60 border border-${card.color}-200/60 dark:border-${card.color}-800/50 flex items-center justify-center text-${card.color}-600 dark:text-${card.color}-400`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Cari nama software, versi, vendor, atau kategori..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleOpenExportModal("all")}
                disabled={downloadingDocx}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh daftar software terfilter ke template dokumen FR-017 (.docx)"
              >
                {downloadingDocx ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
                <span>Ekspor (DOCX)</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Software Standar</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Kategori Lisensi:</label>
              <select value={kategoriId} onChange={(e) => { setKategoriId(e.target.value); setPage(1); }} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200">
                <option value="">Semua Kategori</option>
                {availableKategoris.map((k) => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Tipe Perangkat Lunak:</label>
              <select value={tipeSoftwareId} onChange={(e) => { setTipeSoftwareId(e.target.value); setPage(1); }} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200">
                <option value="">Semua Tipe Software</option>
                {availableTipes.map((t) => <option key={t.id} value={t.id}>{t.nama_tipe_software}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Penyedia / Vendor:</label>
              <select value={penyediaBarangId} onChange={(e) => { setPenyediaBarangId(e.target.value); setPage(1); }} className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200">
                <option value="">Semua Penyedia / Vendor</option>
                {lookups.penyedia_barangs.map((p) => <option key={p.id} value={p.id}>{p.nama_penyedia_barang}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleResetFilter} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all">
                <RotateCcw size={13} />
                <span>Reset Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header Info */}
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">Daftar Software Standar SMKI</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Menampilkan {items.length} dari {meta.total} data inventaris</span>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4">NAMA SOFTWARE</th>
                  <th className="py-3 px-4">TIPE SOFTWARE</th>
                  <th className="py-3 px-4">VERSI</th>
                  <th className="py-3 px-4">PENYEDIA BARANG / VENDOR</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4 text-center w-40">AKSI &amp; EXPORT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="animate-spin text-emerald-600" />
                        <span className="font-medium text-xs">Memuat data software standar...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <AlertCircle size={32} className="text-amber-500 mb-1" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Data Software Tidak Ditemukan</span>
                        <p className="text-xs text-slate-400">Tidak ada software standar yang cocok dengan filter atau kata kunci saat ini.</p>
                        <button onClick={handleResetFilter} className="mt-2 text-xs font-semibold text-emerald-600 hover:underline">Bersihkan Filter</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Render per kelompok
                  groups.map((group, gIdx) => {
                    const displayNo = group.nomor ?? (gIdx + 1);
                    return group.items.map((item, subIdx) => {
                      const isFirst = subIdx === 0;
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isFirst && gIdx > 0 ? "border-t-2 border-emerald-100 dark:border-emerald-900/50" : ""
                            }`}
                        >
                          {/* NO: hanya tampil di baris pertama tiap kelompok */}
                          <td className="py-3.5 px-4 text-center font-bold text-slate-500 align-top">
                            {isFirst ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                                  {displayNo}
                                </span>
                                {group.items.length > 1 && (
                                  <span className="text-[9px] text-slate-400 font-medium">({group.items.length} versi)</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <div className="w-0.5 h-5 bg-emerald-200 dark:bg-emerald-800/60 rounded-full" />
                              </div>
                            )}
                          </td>

                          {/* Nama Software */}
                          <td className="py-3.5 px-4">
                            <div className={`font-bold text-slate-800 dark:text-slate-100 text-xs ${!isFirst ? "text-slate-500 dark:text-slate-400" : ""}`}>
                              {item.nama_software}
                            </div>
                            {item.keterangan && (
                              <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.keterangan}</div>
                            )}
                          </td>

                          {/* Tipe Software */}
                          <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                            {item.tipe_software?.nama_tipe_software || "-"}
                          </td>

                          {/* Versi */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
                              {item.versi || "-"}
                            </span>
                          </td>

                          {/* Penyedia */}
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            {item.penyedia_barang?.nama_penyedia_barang || "-"}
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 px-4">
                            {getKategoriBadge(item.kategori?.nama_kategori)}
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Tambah versi ke kelompok ini (hanya di baris pertama) */}
                              {isFirst && (
                                <button
                                  onClick={() => handleOpenAddToGroupModal(displayNo as number, item)}
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/80 dark:border-emerald-800/60 transition-all cursor-pointer"
                                  title="Tambah baris software ke kelompok nomor ini"
                                >
                                  <Plus size={13} />
                                </button>
                              )}

                              {/* Download single item */}
                              <button
                                onClick={() => handleOpenExportModal("single", item.id)}
                                disabled={downloadingItemId === item.id}
                                className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/80 dark:border-teal-800/60 transition-all cursor-pointer"
                                title="Ekspor item ini ke Dokumen Template FR-017 (.docx)"
                              >
                                {downloadingItemId === item.id ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer"
                                title="Ubah Data Software"
                              >
                                <Pencil size={13} />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleOpenDeleteModal(item)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200/80 dark:border-rose-800/60 transition-all cursor-pointer"
                                title="Hapus Software dari Standar"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {meta.last_page > 1 && (
            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Halaman {meta.current_page} dari {meta.last_page}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.current_page <= 1} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold">Sebelumnya</button>
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => setPage(pg)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pg === meta.current_page ? "bg-emerald-600 text-white shadow-sm" : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"}`}>
                    {pg}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={meta.current_page >= meta.last_page} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 font-semibold">Selanjutnya</button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL FORM: TAMBAH / EDIT SOFTWARE STANDAR                  */}
        {/* ============================================================ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    <Laptop size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {isEditMode ? "Ubah Data Software Standar" : isNewKelompok ? "Tambah Software Standar Baru" : `Tambah Versi ke Kelompok No. ${formNomorKelompok}`}
                    </h3>
                    <p className="text-[11px] text-emerald-100">Formulir Inventarisasi SMKI — FR-017</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex flex-col gap-4">

                {/* Nomor Kelompok */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Hash size={13} className="text-emerald-600" />
                    Nomor Kelompok (No. di Dokumen FR-017)
                  </label>

                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => { setIsNewKelompok(true); setFormNomorKelompok(getNextNomorKelompok()); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isNewKelompok ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400"}`}
                    >
                      Nomor Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsNewKelompok(false); setFormNomorKelompok(lookups.nomor_terpakai?.[0] ?? 1); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!isNewKelompok ? "bg-emerald-600 text-white border-emerald-600" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400"}`}
                    >
                      Kelompok yang Ada
                    </button>
                  </div>

                  {isNewKelompok ? (
                    <input
                      type="number"
                      min={1}
                      value={formNomorKelompok}
                      onChange={(e) => setFormNomorKelompok(e.target.value ? Number(e.target.value) : "")}
                      placeholder="Masukkan nomor kelompok (misal: 1, 2, 3...)"
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                    />
                  ) : (
                    <select
                      value={formNomorKelompok}
                      onChange={(e) => setFormNomorKelompok(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                    >
                      <option value="">-- Pilih Kelompok Existing --</option>
                      {(lookups.nomor_terpakai ?? []).map((n) => (
                        <option key={n} value={n}>Kelompok No. {n}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Satu nomor kelompok dapat memiliki beberapa baris software dengan versi yang berbeda (seperti format FR-017 asli).
                  </p>
                </div>

                {/* Nama Software */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Nama Software <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Microsoft Windows, Google Chrome, Adobe Photoshop"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                  />
                </div>

                {/* Versi & Tipe Software */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                      Versi Build / Rilis <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formVersi}
                      onChange={(e) => setFormVersi(e.target.value)}
                      placeholder="Contoh: 11 Pro, 2021, v128.0"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Tipe Software <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setIsCustomTipe(!isCustomTipe); setFormTipeBaru(""); }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {isCustomTipe ? "Pilih dari Daftar Tipe" : "+ Input Tipe Baru"}
                      </button>
                    </div>
                    {isCustomTipe ? (
                      <input
                        type="text"
                        value={formTipeBaru}
                        onChange={(e) => setFormTipeBaru(e.target.value)}
                        placeholder="Contoh: Design Tool, CAD, Utility..."
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                      />
                    ) : (
                      <select
                        required
                        value={formTipeId}
                        onChange={(e) => setFormTipeId(Number(e.target.value))}
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                      >
                        <option value="">Pilih Tipe Software</option>
                        {availableTipes.map((t) => <option key={t.id} value={t.id}>{t.nama_tipe_software}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                {/* Kategori Software (Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Kategori Software <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formKategoriId}
                    onChange={(e) => setFormKategoriId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                  >
                    <option value="">Pilih Kategori Software</option>
                    {availableKategoris.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kategori} {k.keterangan ? `(${k.keterangan})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Penyedia Barang / Vendor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Penyedia Barang / Vendor</label>
                    <button type="button" onClick={() => { setIsCustomVendor(!isCustomVendor); setFormPenyediaBaru(""); }} className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                      {isCustomVendor ? "Pilih dari Daftar Vendor" : "+ Input Vendor Baru"}
                    </button>
                  </div>
                  {isCustomVendor ? (
                    <input
                      type="text"
                      value={formPenyediaBaru}
                      onChange={(e) => setFormPenyediaBaru(e.target.value)}
                      placeholder="Masukkan nama vendor baru (contoh: Canonical Ltd, JetBrains, dll)"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                    />
                  ) : (
                    <select
                      value={formPenyediaId}
                      onChange={(e) => setFormPenyediaId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white"
                    >
                      <option value="">Pilih Vendor / Penyedia Barang</option>
                      {lookups.penyedia_barangs.map((p) => <option key={p.id} value={p.id}>{p.nama_penyedia_barang}</option>)}
                    </select>
                  )}
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Keterangan Tambahan (Opsional)</label>
                  <textarea
                    rows={2}
                    value={formKeterangan}
                    onChange={(e) => setFormKeterangan(e.target.value)}
                    placeholder="Catatan tujuan penggunaan, peruntukan instalasi, atau nomor lisensi..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800 dark:text-white resize-none"
                  />
                </div>



                {/* Modal Footer / Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={submitting} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-all">
                    Batal
                  </button>
                  <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer">
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    <span>{isEditMode ? "Simpan Perubahan" : "Simpan Data Software"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL EKSPOR DOCX: Input metadata header dokumen            */}
        {/* ============================================================ */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <FileEdit size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Detail Dokumen FR-017</h3>
                    <p className="text-[11px] text-teal-100">Isi informasi header sebelum ekspor</p>
                  </div>
                </div>
                <button onClick={() => setIsExportModalOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-800 dark:text-blue-200">
                  <strong>Informasi ini akan terisi pada header tabel dokumen Word.</strong><br />
                  Kosongkan jika ingin menggunakan nilai default dari template FR-017.
                </div>

                {/* No Dokumen */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">No. Dokumen</label>
                  <input
                    type="text"
                    value={exportNoDokumen}
                    onChange={(e) => setExportNoDokumen(e.target.value)}
                    placeholder="FR-017/KOM.03.05/ SANDIKAMI"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 dark:text-white"
                  />
                </div>

                {/* No Revisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">No. Revisi</label>
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Tanggal Berlaku</label>
                  <input
                    type="text"
                    value={exportTanggalBerlaku}
                    onChange={(e) => setExportTanggalBerlaku(e.target.value)}
                    placeholder="07 Juli 2022"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 dark:text-white"
                  />
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    disabled={downloadingDocx}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDoExport}
                    disabled={downloadingDocx}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {downloadingDocx ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    <span>Unduh Dokumen (.docx)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL DIALOG KONFIRMASI HAPUS DATA                         */}
        {/* ============================================================ */}
        {isDeleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Hapus Data Software Standar?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Apakah Anda yakin ingin menghapus{" "}
                <strong className="text-slate-700 dark:text-slate-200">{itemToDelete.nama_software} ({itemToDelete.versi})</strong>{" "}
                dari daftar inventaris resmi SMKI?
              </p>
              <div className="flex items-center justify-center gap-3 w-full">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="button" onClick={handleConfirmDelete} disabled={deleting} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all disabled:opacity-50 cursor-pointer">
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  <span>Ya, Hapus Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ServiceRouteGuard>
  );
}

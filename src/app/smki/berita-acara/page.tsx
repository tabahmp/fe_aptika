"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  Eye,
  FileDown,
  Download,
  Calendar,
  Clock,
  Building2,
  AlertCircle,
  X,
  ChevronRight,
  HardDrive,
  Laptop,
  CheckCircle2,
  Info,
  Loader2,
  ShieldCheck,
  Package,
  Cpu,
  Hash,
  ClipboardList,
  Monitor,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getBeritaAcaraList,
  getBeritaAcaraLookup,
  getBeritaAcaraDetail,
  createBeritaAcara,
  updateBeritaAcara,
  deleteBeritaAcara,
  downloadBeritaAcaraDocx,
  BeritaAcaraItem,
  DetailMediaItem,
  BeritaAcaraStats,
  BeritaAcaraLookupData,
} from "@/services/api";

// Helper helper untuk format tanggal Indonesia
const HARI_INDO = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN_INDO = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = BULAN_INDO[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatTanggalKalimat(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const hari = HARI_INDO[d.getDay()];
  const day = d.getDate();
  const month = BULAN_INDO[d.getMonth()];
  const year = d.getFullYear();
  return `Pada hari ini ${hari}, tanggal ${day}, bulan ${month}, tahun ${year} telah dilakukan kegiatan Penghancuran/Disposal terhadap media sebagai berikut:`;
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function BeritaAcaraPenghancuranPage() {
  const router = useRouter();
  const { user, bidang } = useAuthStore();

  // State List Data & KPI
  const [items, setItems] = useState<BeritaAcaraItem[]>([]);
  const [stats, setStats] = useState<BeritaAcaraStats>({
    total_data: 0,
    data_hari_ini: 0,
    data_dihapus: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // State Lookup Master
  const [lookups, setLookups] = useState<BeritaAcaraLookupData>({
    users: [],
    recommended_doc_no: "BA-001/SMKI/2026",
    default_revisi: "1.0",
    default_berlaku: "15 September 2025",
  });

  // Modal State: Create / Edit Data Utama
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields Data Utama
  const [formNomorDokumen, setFormNomorDokumen] = useState("");
  const [formTanggalPelaksanaan, setFormTanggalPelaksanaan] = useState("");
  const [formAlasan, setFormAlasan] = useState("");
  const [formPelaksanaId, setFormPelaksanaId] = useState<string>("");
  const [formPelaksanaCustom, setFormPelaksanaCustom] = useState("");
  const [formDiketahuiId, setFormDiketahuiId] = useState<string>("");
  const [formDiketahuiCustom, setFormDiketahuiCustom] = useState("");

  // Media Items State (Array rincian media pada modal create/edit)
  const [mediaItems, setMediaItems] = useState<DetailMediaItem[]>([]);

  // Modal State: Child Tambah / Edit Media
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalMode, setMediaModalMode] = useState<"add" | "edit">("add");
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);

  // Child Media Form Fields
  const [mediaNama, setMediaNama] = useState("");
  const [mediaSpesifikasi, setMediaSpesifikasi] = useState("");
  const [mediaJenis, setMediaJenis] = useState("Storage");
  const [mediaJumlah, setMediaJumlah] = useState<number | "">(1);
  const [mediaSatuan, setMediaSatuan] = useState("Unit");
  const [mediaSerial, setMediaSerial] = useState("");
  const [mediaKeterangan, setMediaKeterangan] = useState("");

  // Modal State: Preview Dokumen FR-014
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BeritaAcaraItem | null>(null);

  // Modal State: Export DOCX
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetBa, setExportTargetBa] = useState<BeritaAcaraItem | null>(null);
  const [exportDocNo, setExportDocNo] = useState("");
  const [exportRevisi, setExportRevisi] = useState("1.0");
  const [exportTanggalBerlaku, setExportTanggalBerlaku] = useState("15 September 2025");
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // Modal State: Delete Confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BeritaAcaraItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch Lookups
  const fetchLookups = async () => {
    try {
      const res = await getBeritaAcaraLookup();
      if (res?.success) {
        setLookups(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat lookup data:", err);
    }
  };

  // 2. Fetch Data List
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getBeritaAcaraList({
        search: search || undefined,
        page,
        per_page: 10,
      });

      if (res?.success) {
        setItems(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
        if (res.meta) {
          setMeta(res.meta);
        }
      }
    } catch (err: any) {
      console.error("Gagal memuat berita acara:", err);
      toast.error("Gagal memuat daftar berita acara.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    fetchList();
  }, [page, search]);

  // Handle Trigger Download Blob
  const triggerDocxBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Buka Modal Tambah Data Utama
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormNomorDokumen(lookups.recommended_doc_no || "");
    // Biarkan kosong agar placeholder dd/mm/yyyy tampil persis seperti mockup
    setFormTanggalPelaksanaan("");
    setFormAlasan("");
    setFormPelaksanaId("");
    setFormPelaksanaCustom("");
    setFormDiketahuiId("");
    setFormDiketahuiCustom("");
    setMediaItems([]);
    setIsFormModalOpen(true);
  };

  // Buka Modal Edit Data Utama
  const handleOpenEditModal = (item: BeritaAcaraItem) => {
    setIsEditMode(true);
    setEditingId(item.id_ba);
    setFormNomorDokumen(item.nomor_dokumen || "");
    setFormTanggalPelaksanaan(item.tanggal_pelaksanaan ? item.tanggal_pelaksanaan.substring(0, 10) : "");
    setFormAlasan(item.alasan_penghancuran || "");
    setFormPelaksanaId(item.id_pelaksana ? String(item.id_pelaksana) : "");
    setFormPelaksanaCustom(item.nama_pelaksana || "");
    setFormDiketahuiId(item.id_diketahui ? String(item.id_diketahui) : "");
    setFormDiketahuiCustom(item.nama_diketahui || "");
    setMediaItems(item.detail_media ? [...item.detail_media] : []);
    setIsFormModalOpen(true);
  };

  // Buka Child Modal Tambah Media
  const handleOpenAddMediaModal = () => {
    setMediaModalMode("add");
    setEditingMediaIndex(null);
    setMediaNama("");
    setMediaSpesifikasi("");
    setMediaJenis("Storage");
    setMediaJumlah(1);
    setMediaSatuan("Unit");
    setMediaSerial("");
    setMediaKeterangan("");
    setIsMediaModalOpen(true);
  };

  // Buka Child Modal Edit Media
  const handleOpenEditMediaModal = (index: number) => {
    const target = mediaItems[index];
    if (!target) return;
    setMediaModalMode("edit");
    setEditingMediaIndex(index);
    setMediaNama(target.nama_perangkat || "");
    setMediaSpesifikasi(target.spesifikasi || "");
    setMediaJenis(target.jenis_media || "Storage");
    setMediaJumlah(target.jumlah || 1);
    setMediaSatuan(target.satuan || "Unit");
    setMediaSerial(target.serial_number || "");
    setMediaKeterangan(target.keterangan || "");
    setIsMediaModalOpen(true);
  };

  // Hapus baris media dari list sementara di form
  const handleDeleteMediaRow = (index: number) => {
    const next = [...mediaItems];
    next.splice(index, 1);
    setMediaItems(next);
  };

  // Simpan media dari child modal ke state parent form
  // NOTE: Modal sengaja TIDAK ditutup agar user bisa terus menambah media
  const handleSaveChildMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaNama.trim()) {
      toast.error("Nama perangkat media wajib diisi!");
      return;
    }
    if (!mediaJumlah || Number(mediaJumlah) <= 0) {
      toast.error("Jumlah perangkat minimal 1!");
      return;
    }

    const newItem: DetailMediaItem = {
      nama_perangkat: mediaNama.trim(),
      spesifikasi: mediaSpesifikasi.trim() || null,
      jenis_media: mediaJenis,
      serial_number: mediaSerial.trim() || null,
      jumlah: Number(mediaJumlah),
      satuan: "Unit",
      keterangan: mediaKeterangan.trim() || null,
      spesifikasi_serial_display: `${mediaSpesifikasi.trim()}${mediaSerial.trim() ? ` / S/N: ${mediaSerial.trim()}` : ""}`,
    };

    if (mediaModalMode === "add") {
      setMediaItems((prev) => [...prev, newItem]);
      // Bersihkan form, JANGAN tutup modal
      setMediaNama("");
      setMediaSpesifikasi("");
      setMediaJenis("Storage");
      setMediaJumlah(1);
      setMediaSerial("");
      setMediaKeterangan("");
      toast.success("Media berhasil ditambahkan ke daftar.");
    } else if (mediaModalMode === "edit" && editingMediaIndex !== null) {
      const next = [...mediaItems];
      next[editingMediaIndex] = newItem;
      setMediaItems(next);
      // Kembali ke mode add, bersihkan form, JANGAN tutup modal
      setMediaModalMode("add");
      setEditingMediaIndex(null);
      setMediaNama("");
      setMediaSpesifikasi("");
      setMediaJenis("Storage");
      setMediaJumlah(1);
      setMediaSerial("");
      setMediaKeterangan("");
      toast.success("Rincian media berhasil diperbarui.");
    }
    // Modal tetap terbuka — user tutup manual via tombol Batal atau X
  };

  // Submit Simpan / Update Berita Acara Utama
  const handleSaveMainForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Kelengkapan Data
    if (!formTanggalPelaksanaan) {
      toast.error("Tanggal pelaksanaan kegiatan wajib dipilih!");
      return;
    }
    if (!formAlasan.trim()) {
      toast.error("Alasan penghancuran media wajib diisi!");
      return;
    }
    if (!formPelaksanaId && !formPelaksanaCustom.trim()) {
      toast.error("Pelaksana kegiatan wajib dipilih atau diisi!");
      return;
    }
    if (!formDiketahuiId && !formDiketahuiCustom.trim()) {
      toast.error("Pihak yang mengetahui wajib dipilih atau diisi!");
      return;
    }
    if (mediaItems.length === 0) {
      toast.error("Wajib menambahkan minimal 1 (satu) rincian media perangkat yang dihancurkan!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nomor_dokumen: formNomorDokumen.trim() || undefined,
        tanggal_pelaksanaan: formTanggalPelaksanaan,
        alasan_penghancuran: formAlasan.trim(),
        id_pelaksana: formPelaksanaId ? Number(formPelaksanaId) : null,
        id_diketahui: formDiketahuiId ? Number(formDiketahuiId) : null,
        nama_pelaksana: formPelaksanaCustom.trim() || undefined,
        nama_diketahui: formDiketahuiCustom.trim() || undefined,
        detail_media: mediaItems.map((m, idx) => ({
          no_urut: idx + 1,
          nama_perangkat: m.nama_perangkat,
          spesifikasi: m.spesifikasi || null,
          jenis_media: m.jenis_media || null,
          serial_number: m.serial_number || null,
          jumlah: Number(m.jumlah) || 1,
          satuan: m.satuan || "Unit",
          keterangan: m.keterangan || null,
        })),
      };

      if (isEditMode && editingId) {
        await updateBeritaAcara(editingId, payload);
        toast.success("Berita Acara berhasil diperbarui!");
      } else {
        await createBeritaAcara(payload);
        toast.success("Berita Acara berhasil dibuat dan disimpan!");
      }

      setIsFormModalOpen(false);
      fetchList();
      fetchLookups();
    } catch (err: any) {
      console.error("Gagal menyimpan data:", err);
      const msg = err?.response?.data?.message || "Terjadi kesalahan saat menyimpan data.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Buka Modal Detail Preview FR-014
  const handleOpenDetailPreview = async (item: BeritaAcaraItem) => {
    try {
      const res = await getBeritaAcaraDetail(item.id_ba);
      if (res?.success) {
        setPreviewData(res.data);
      } else {
        setPreviewData(item);
      }
    } catch (_) {
      setPreviewData(item);
    }
    setIsPreviewModalOpen(true);
  };

  // Buka Modal Export DOCX
  const handleOpenExportModal = (item?: BeritaAcaraItem) => {
    const target = item || items[0] || null;
    setExportTargetBa(target);
    setExportDocNo(target?.nomor_dokumen || lookups.recommended_doc_no || "FR014-SMKI");
    setExportRevisi(lookups.default_revisi || "1.0");
    setExportTanggalBerlaku(
      target?.tanggal_pelaksanaan ? formatTanggalIndo(target.tanggal_pelaksanaan) : lookups.default_berlaku || "15 September 2025"
    );
    setIsExportModalOpen(true);
  };

  // Eksekusi Download DOCX
  const handleExecuteExportDocx = async () => {
    if (!exportTargetBa && items.length === 0) {
      toast.error("Belum ada data berita acara yang tersedia untuk diekspor.");
      return;
    }

    setDownloadingDocx(true);
    try {
      const targetId = exportTargetBa ? exportTargetBa.id_ba : undefined;
      const blob = await downloadBeritaAcaraDocx({
        id: targetId,
        no_dokumen: exportDocNo || undefined,
        no_revisi: exportRevisi || undefined,
        tanggal_berlaku: exportTanggalBerlaku || undefined,
      });

      const dateClean = new Date().toISOString().slice(0, 10);
      const docClean = (exportDocNo || "FR014").replace(/[^a-zA-Z0-9_\-]/g, "_");
      triggerDocxBlobDownload(blob, `FR014_SMKI_Berita_Acara_${docClean}_${dateClean}.docx`);
      toast.success("Dokumen Berita Acara (.docx) berhasil diunduh!");
      setIsExportModalOpen(false);
    } catch (err: any) {
      console.error("Gagal mengunduh DOCX:", err);
      toast.error("Gagal menghasilkan dokumen Word (.docx).");
    } finally {
      setDownloadingDocx(false);
    }
  };

  // Buka Modal Delete Confirmation
  const handleOpenDeleteModal = (item: BeritaAcaraItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // Eksekusi Hapus Data Berita Acara
  const handleExecuteDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteBeritaAcara(itemToDelete.id_ba);
      toast.success(`Berita acara ${itemToDelete.nomor_dokumen} berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchList();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal menghapus berita acara.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-16">
        {/* ============================================================ */}
        {/* 1. HERO BANNER HEADER (Design Mockup Page 1)                 */}
        {/* ============================================================ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                <FileText size={26} />
              </div>
              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
                  Berita Acara Penghancuran Media
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
                  Kelola data berita acara penghancuran media sesuai dengan formulir FR014-SMKI dengan mudah dan terstruktur.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold text-emerald-50 shadow-sm">
                <Building2 size={16} className="text-emerald-300" />
                <span>Unit Kerja: <strong className="text-white font-bold">{bidang?.name || "Unit Kerja Bidang Informatika"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. THREE SUMMARY KPI CARDS (Design Mockup Page 1)            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Data */}
          <div
            onClick={() => setSearch("")}
            className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <FileText size={20} />
              </div>
              <div className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Total Data
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.total_data}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Berita acara tersimpan
              </p>
            </div>
          </div>

          {/* Card 2: Data Hari Ini */}
          <div className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Clock size={20} />
              </div>
              <div className="text-slate-400">
                <ChevronRight size={18} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Data Hari Ini
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.data_hari_ini}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Ditambahkan hari ini
              </p>
            </div>
          </div>

          {/* Card 3: Data Dihapus / Audit Trackers */}
          <div className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/70 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                <Trash2 size={20} />
              </div>
              <div className="text-slate-400">
                <ChevronRight size={18} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Data Dihapus
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.data_dihapus}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Dalam periode ini
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. TOOLBAR & SEARCH SECTION                                  */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
              Daftar Berita Acara
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Riwayat dokumen formulir penghancuran media standar FR014-SMKI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search */}
            <div className="relative flex-1 sm:w-72">
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
                placeholder="Cari nomor dokumen, pelaksana, atau k..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Tombol Ekspor (DOCX) */}
            <button
              onClick={() => handleOpenExportModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              <FileDown size={15} className="text-slate-500 dark:text-slate-400" />
              <span>Ekspor (DOCX)</span>
            </button>

            {/* Tombol Tambah Data */}
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow transition-all"
            >
              <Plus size={16} />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN DATA TABLE (Design Mockup Page 1)                    */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Memuat data berita acara...</p>
            </div>
          ) : items.length === 0 ? (
            /* Secondary Flow: Empty State Alert */
            <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm">
                <FileText size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                Data belum tersedia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
                Belum ada dokumen Berita Acara Penghancuran Media yang tersimpan. Silakan klik tombol di bawah untuk membuat laporan pertama.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all"
              >
                <Plus size={15} />
                <span>Tambah Berita Acara Pertama</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    <th className="py-3.5 px-4 w-12 text-center">No.</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">No. Dokumen</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Form</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Tanggal Pelaksanaan</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Alasan</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Pelaksana</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Diketahui</th>
                    <th className="py-3.5 px-4 text-center w-36 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {items.map((item, idx) => {
                    const rowNumber = (page - 1) * meta.per_page + (idx + 1);
                    return (
                      <tr
                        key={item.id_ba}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center font-medium text-slate-500 dark:text-slate-400">
                          {rowNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {item.nomor_dokumen || `BA-${String(item.id_ba).padStart(3, "0")}/SMKI/2026`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatShortDate(item.created_at)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatShortDate(item.tanggal_pelaksanaan)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <p className="line-clamp-2" title={item.alasan_penghancuran}>
                            {item.alasan_penghancuran || "-"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                          {item.nama_pelaksana_display}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                          {item.nama_diketahui_display}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Ekspor Dokumen DOCX Spesifik */}
                            <button
                              onClick={() => handleOpenExportModal(item)}
                              title="Unduh Formulir FR-014 (.docx)"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
                            >
                              <FileDown size={15} />
                            </button>

                            {/* Lihat Detail (Preview FR-014) */}
                            <button
                              onClick={() => handleOpenDetailPreview(item)}
                              title="Lihat Detail Berita Acara"
                              className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 transition-colors"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Edit Data */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Data Berita Acara"
                              className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Hapus Data */}
                            <button
                              onClick={() => handleOpenDeleteModal(item)}
                              title="Hapus Berita Acara"
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer & Pagination */}
          {!loading && items.length > 0 && (
            <div className="py-3.5 px-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Menampilkan <strong className="text-slate-800 dark:text-white">{(page - 1) * meta.per_page + 1}</strong> - <strong className="text-slate-800 dark:text-white">{Math.min(page * meta.per_page, meta.total)}</strong> dari <strong className="text-slate-800 dark:text-white">{meta.total}</strong> data
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium transition-all"
                >
                  &lt;
                </button>

                {Array.from({ length: meta.last_page || 1 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      page === num
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, meta.last_page))}
                  disabled={page >= meta.last_page}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-medium transition-all"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL 1: CREATE / EDIT DATA UTAMA (Design Mockup Page 2 & 7) */}
        {/* ============================================================ */}
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header Modal */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    {isEditMode ? <Pencil size={15} /> : <Plus size={15} strokeWidth={2.5} />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isEditMode ? "Edit Data Berita Acara" : "Tambah Data Berita Acara"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveMainForm} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* SECTION 1: DATA UTAMA */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      Data Utama
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Tanggal Pelaksanaan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Tanggal Pelaksanaan <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formTanggalPelaksanaan}
                        onChange={(e) => setFormTanggalPelaksanaan(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    {/* Pelaksana */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Pelaksana <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formPelaksanaId}
                        onChange={(e) => {
                          setFormPelaksanaId(e.target.value);
                          if (e.target.value) {
                            const found = lookups.users.find((u) => u.id === Number(e.target.value));
                            if (found) setFormPelaksanaCustom(found.name);
                          } else {
                            setFormPelaksanaCustom("");
                          }
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        <option value="">Nama Pelaksana</option>
                        {lookups.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} {u.position ? `(${u.position})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Alasan Penghancuran */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Alasan Penghancuran <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formAlasan}
                        onChange={(e) => setFormAlasan(e.target.value)}
                        placeholder="Masukkan alasan penghancuran media secara detail..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none h-[78px]"
                      />
                    </div>

                    {/* Yang Mengetahui */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Yang Mengetahui <span className="text-rose-500">*</span>
                      </label>
                      <div className="space-y-1.5">
                        {/* Input custom dulu (sesuai mockup), lalu dropdown */}
                        <input
                          type="text"
                          value={formDiketahuiCustom}
                          onChange={(e) => setFormDiketahuiCustom(e.target.value)}
                          placeholder="Nama pemberi izin..."
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                        <select
                          value={formDiketahuiId}
                          onChange={(e) => {
                            setFormDiketahuiId(e.target.value);
                            if (e.target.value) {
                              const found = lookups.users.find((u) => u.id === Number(e.target.value));
                              if (found) setFormDiketahuiCustom(found.name);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                          <option value="">Nama Pengawas</option>
                          {lookups.users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} {u.position ? `(${u.position})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DETAIL MEDIA */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        Detail Media
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenAddMediaModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors"
                    >
                      <Plus size={14} />
                      <span>Tambah Media</span>
                    </button>
                  </div>

                  {/* Table Rincian Media */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            <th className="py-2.5 px-3 w-10 text-center">No.</th>
                            <th className="py-2.5 px-3">Nama Perangkat</th>
                            <th className="py-2.5 px-3">Spesifikasi</th>
                            <th className="py-2.5 px-3">Serial Number</th>
                            <th className="py-2.5 px-3 text-center w-20">Jumlah</th>
                            <th className="py-2.5 px-3">Keterangan</th>
                            <th className="py-2.5 px-3 text-center w-20">Aksi</th>
                          </tr>
                        </thead>
                        {mediaItems.length === 0 ? (
                          <tbody>
                            <tr>
                              <td colSpan={7} className="py-12 px-4 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2">
                                    <Monitor size={32} strokeWidth={1.5} />
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Belum ada data media
                                  </p>
                                  <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                                    Silakan klik tombol &apos;Tambah Media&apos; untuk mulai memasukkan rincian perangkat yang akan dihancurkan.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        ) : (
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {mediaItems.map((m, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                <td className="py-2.5 px-3 text-center font-medium text-slate-500">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white">
                                  {m.nama_perangkat}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                  {m.spesifikasi || "-"}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                  {m.serial_number || "-"}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-white">
                                  {m.jumlah} {m.satuan || "Unit"}
                                </td>
                                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                                  {m.keterangan || "-"}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditMediaModal(idx)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                      title="Edit media"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMediaRow(idx)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                      title="Hapus media"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        )}
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <Ban size={13} className="text-slate-400" />
                    <span>Batal</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white shadow-sm transition-all"
                  >
                    {submitting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>{isEditMode ? "Simpan Perubahan" : "Simpan"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 2: CHILD TAMBAH / EDIT MEDIA (Design Mockup Page 3)   */}
        {/* ============================================================ */}
        {isMediaModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {mediaModalMode === "add" ? "Tambah Media" : "Edit Rincian Media"}
                    </h3>
                    <p className="text-[11px] text-slate-400">Masukkan data media yang akan dihancurkan.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSaveChildMedia} className="p-6 space-y-5">

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Nama Media */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nama Media <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Laptop size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={mediaNama}
                          onChange={(e) => setMediaNama(e.target.value)}
                          placeholder="Contoh: Laptop, Harddisk, Flashdisk"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Spesifikasi */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Spesifikasi <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Cpu size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={mediaSpesifikasi}
                          onChange={(e) => setMediaSpesifikasi(e.target.value)}
                          placeholder="Contoh: Intel Core i5, 1 TB, 32 GB"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Jenis Media */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jenis Media <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <HardDrive size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <select
                          value={mediaJenis}
                          onChange={(e) => setMediaJenis(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 appearance-none"
                        >
                          <option value="">Pilih jenis media</option>
                          <option value="Storage">Storage / Penyimpanan (HDD, SSD, Flashdisk)</option>
                          <option value="Laptop">Laptop / Notebook</option>
                          <option value="PC">PC / Komputer Desktop</option>
                          <option value="Tape">Magnetic Tape / LTO Cartridge</option>
                          <option value="Optical">Optical Disc (CD/DVD/Blu-ray)</option>
                          <option value="Smartphone">Smartphone / Tablet</option>
                          <option value="Lainnya">Perangkat Elektronik Lainnya</option>
                        </select>
                      </div>
                    </div>

                    {/* Jumlah */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Jumlah <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          type="number"
                          min={1}
                          required
                          value={mediaJumlah}
                          onChange={(e) => setMediaJumlah(e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder="Masukkan jumlah"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Keterangan - full width */}
                    <div className="sm:col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Keterangan</label>
                        <span className="text-[10px] text-slate-400">{mediaKeterangan.length}/200</span>
                      </div>
                      <div className="relative">
                        <FileText size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                        <textarea
                          rows={2}
                          maxLength={200}
                          value={mediaKeterangan}
                          onChange={(e) => setMediaKeterangan(e.target.value)}
                          placeholder="Masukkan keterangan tambahan (opsional)"
                          className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Daftar Media yang Ditambahkan ── */}
                  <div className="pt-1">
                    <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                      Daftar Media yang Ditambahkan
                    </h4>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {mediaItems.length === 0 ? (
                        <div className="py-10 px-4 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-800/30">
                          <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-2">
                            <ClipboardList size={20} />
                          </div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Belum ada data media yang ditambahkan.
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                            Silakan isi formulir di atas dan klik simpan untuk menambahkan data ke daftar.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                                <th className="py-2.5 px-3 w-10 text-center">No.</th>
                                <th className="py-2.5 px-3">Nama Media</th>
                                <th className="py-2.5 px-3">Spesifikasi</th>
                                <th className="py-2.5 px-3">Jenis</th>
                                <th className="py-2.5 px-3 text-center w-20">Jumlah</th>
                                <th className="py-2.5 px-3">Keterangan</th>
                                <th className="py-2.5 px-3 text-center w-20">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {mediaItems.map((m, idx) => (
                                <tr
                                  key={idx}
                                  className={`transition-colors ${
                                    editingMediaIndex === idx
                                      ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                  }`}
                                >
                                  <td className="py-2 px-3 text-center font-medium text-slate-500">{idx + 1}</td>
                                  <td className="py-2 px-3 font-bold text-slate-800 dark:text-white">{m.nama_perangkat}</td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.spesifikasi || "-"}</td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.jenis_media || "-"}</td>
                                  <td className="py-2 px-3 text-center font-bold text-slate-800 dark:text-white">
                                    {m.jumlah} {m.satuan || "Unit"}
                                  </td>
                                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{m.keterangan || "-"}</td>
                                  <td className="py-2 px-3 text-center">
                                    <div className="inline-flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditMediaModal(idx)}
                                        title="Edit media ini"
                                        className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMediaRow(idx)}
                                        title="Hapus media ini"
                                        className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <X size={13} />
                      <span>Batal</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                    >
                      <Plus size={14} />
                      <span>{mediaModalMode === "add" ? "Simpan" : "Simpan Perubahan"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 3: DETAIL PREVIEW FR-014 (Design Mockup Page 5)        */}
        {/* ============================================================ */}
        {isPreviewModalOpen && previewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Preview Dokumen Resmi FR014-SMKI
                  </h3>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Dokumen Paper Preview */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/60 dark:bg-slate-950 flex justify-center">
                <div className="bg-white text-slate-900 shadow-md border border-slate-200 w-full max-w-3xl p-8 sm:p-10 rounded-lg text-xs leading-relaxed">
                  {/* Header Box Diskominfo */}
                  <div className="border border-black flex mb-6">
                    {/* Left: Logo & text */}
                    <div className="w-28 p-3 border-r border-black flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 relative mb-1 flex items-center justify-center">
                        <Image
                          src="/logo-jabar.png"
                          alt="Logo Jabar"
                          width={48}
                          height={48}
                          className="object-contain"
                          onError={(e) => {
                            // Fallback jika image url gagal
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="text-[8px] font-bold tracking-wider leading-tight">
                        DISKOMINFO
                        <br />
                        PROVINSI JAWA BARAT
                      </span>
                    </div>

                    {/* Center: Title */}
                    <div className="flex-1 p-3 flex flex-col items-center justify-center text-center border-r border-black">
                      <h2 className="text-base font-bold leading-tight uppercase">
                        Formulir Berita Acara Penghancuran
                        <br />
                        Media
                      </h2>
                    </div>

                    {/* Right: Meta Table */}
                    <div className="w-48 text-[10px]">
                      <div className="flex border-b border-black">
                        <div className="w-24 p-1.5 font-semibold border-r border-black">No. Dokumen</div>
                        <div className="w-24 p-1.5 font-bold truncate">
                          {previewData.nomor_dokumen || "FR014-SMKI"}
                        </div>
                      </div>
                      <div className="flex border-b border-black">
                        <div className="w-24 p-1.5 font-semibold border-r border-black">No. Revisi</div>
                        <div className="w-24 p-1.5">1.0</div>
                      </div>
                      <div className="flex">
                        <div className="w-24 p-1.5 font-semibold border-r border-black">Tanggal Berlaku</div>
                        <div className="w-24 p-1.5">
                          {formatTanggalIndo(previewData.tanggal_pelaksanaan)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opening Statement */}
                  <p className="mb-4 text-justify font-normal">
                    {formatTanggalKalimat(previewData.tanggal_pelaksanaan)}
                  </p>

                  {/* Nested Media Table */}
                  <table className="w-full border-collapse border border-black mb-6 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-center">
                        <th className="border border-black p-2 w-10">No</th>
                        <th className="border border-black p-2 w-40 text-left">Nama Perangkat</th>
                        <th className="border border-black p-2 text-left">Spesifikasi/ Serial No.</th>
                        <th className="border border-black p-2 w-20">Jumlah</th>
                        <th className="border border-black p-2 w-48 text-left">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.detail_media && previewData.detail_media.length > 0 ? (
                        previewData.detail_media.map((item, i) => (
                          <tr key={i} className="align-top">
                            <td className="border border-black p-2 text-center">{i + 1}.</td>
                            <td className="border border-black p-2 font-medium">{item.nama_perangkat}</td>
                            <td className="border border-black p-2">
                              {item.spesifikasi || "-"}
                              {item.serial_number && (
                                <>
                                  {" "}
                                  / <span className="font-mono">S/N: {item.serial_number}</span>
                                </>
                              )}
                            </td>
                            <td className="border border-black p-2 text-center">
                              {item.jumlah} {item.satuan || "Unit"}
                            </td>
                            <td className="border border-black p-2">{item.keterangan || "-"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="border border-black p-3 text-center text-slate-400">
                            Tidak ada rincian perangkat media
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Alasan Penghancuran */}
                  <div className="mb-10">
                    <p className="font-bold mb-1">Alasan Penghancuran :</p>
                    <p className="text-justify text-slate-800">
                      {previewData.alasan_penghancuran ||
                        "Media/perangkat tersebut dilakukan penghancuran atau disposal karena mengalami kerusakan, sudah tidak digunakan, dan sebagian data di dalamnya sudah tidak diperlukan. Kegiatan penghancuran dilakukan untuk mencegah penggunaan kembali perangkat serta mengurangi risiko akses terhadap informasi yang tersimpan pada media."}
                    </p>
                  </div>

                  {/* Dual Signature Blocks */}
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div className="text-center">
                      <p className="font-bold mb-16">Pelaksana,</p>
                      <p className="font-bold underline text-xs">
                        {previewData.nama_pelaksana_display}
                      </p>
                      <p className="text-[10px] text-slate-600">Unit Pelaksana Teknis</p>
                    </div>

                    <div className="text-center">
                      <p className="font-bold mb-16">Yang Mengetahui,</p>
                      <p className="font-bold underline text-xs">
                        {previewData.nama_diketahui_display}
                      </p>
                      <p className="text-[10px] text-slate-600">Pengawas / Penanggung Jawab</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleOpenExportModal(previewData)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm"
                >
                  <FileDown size={15} />
                  <span>Ekspor ke Word (.docx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL 4: DETAIL DOKUMEN FR-014 EXPORT DOCX (Mockup Page 4)  */}
        {/* ============================================================ */}
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden">
              {/* Header hijau sesuai mockup */}
              <div className="px-6 py-5 bg-emerald-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                    <FileText size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Detail Dokumen FR-014</h3>
                    <p className="text-[11px] text-emerald-100/80">Isi informasi header sebelum ekspor</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Alert Box Info */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
                  <Info size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Informasi ini akan terisi pada header tabel dokumen Word. Kosongkan jika ingin menggunakan nilai default dari template FR-014.
                  </p>
                </div>

                {/* No. Dokumen */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    # No. Dokumen
                  </label>
                  <input
                    type="text"
                    value={exportDocNo}
                    onChange={(e) => setExportDocNo(e.target.value)}
                    placeholder="Contoh: BA-001/SMKI/2025"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                {/* No. Revisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. Revisi
                  </label>
                  <input
                    type="text"
                    value={exportRevisi}
                    onChange={(e) => setExportRevisi(e.target.value)}
                    placeholder="Contoh: 1.0"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                {/* Tanggal Berlaku */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Berlaku
                  </label>
                  <input
                    type="text"
                    value={exportTanggalBerlaku}
                    onChange={(e) => setExportTanggalBerlaku(e.target.value)}
                    placeholder="Contoh: 15 September 2025"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={downloadingDocx}
                    onClick={handleExecuteExportDocx}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white shadow-sm transition-all"
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
        {/* MODAL 5: DELETE CONFIRMATION MODAL (Design Mockup Page 6)    */}
        {/* ============================================================ */}
        {isDeleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-4">
                <Trash2 size={24} />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                Hapus Data Berita Acara
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                Apakah anda yakin ingin menghapus data berita acara{" "}
                <strong className="text-slate-900 dark:text-white font-bold">
                  {itemToDelete.nomor_dokumen || `BA-${itemToDelete.id_ba}`}
                </strong>
                ? Seluruh rincian media terkait akan terhapus.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleExecuteDelete}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white shadow-sm transition-all"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Ya, Hapus</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ServiceRouteGuard>
  );
}

"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit3,
  Pencil,
  Trash2,
  FileDown,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Laptop,
  Cpu,
  Shield,
  Lock,
  User,
  Monitor,
  Database,
  Calendar,
  Clock,
  Sparkles,
  Check,
  Info,
  RotateCcw,
  FileText,
  Building2,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getSmkiFormulirHardeningList,
  getSmkiFormulirHardeningDetail,
  getSmkiFormulirHardeningLookup,
  createSmkiFormulirHardening,
  updateSmkiFormulirHardening,
  deleteSmkiFormulirHardening,
  exportSmkiFormulirHardeningDocx,
  SmkiFormulirHardening,
  HardeningChecklistItem,
  HardeningStats,
} from "@/services/api";

// Fallback template checklist (digunakan jika lookup API belum selesai)
const DEFAULT_CHECKLIST_TEMPLATE: HardeningChecklistItem[] = [
  { kategori: "Sistem Operasi",           item_pengecekan: "Sistem operasi telah diperbarui ke versi terbaru",                                                                                              urutan: 1,  checklist: "Pass", keterangan: "" },
  { kategori: "Sistem Operasi",           item_pengecekan: "Patch keamanan terkini sudah diinstal",                                                                                                         urutan: 2,  checklist: "Pass", keterangan: "" },
  { kategori: "Sistem Operasi",           item_pengecekan: "Firewall telah aktif dan dikonfigurasi dengan benar",                                                                                            urutan: 3,  checklist: "Pass", keterangan: "" },
  { kategori: "Perlindungan Kata Sandi",  item_pengecekan: "Menggunakan kata sandi yang kuat (panjang, kombinasi huruf besar, kecil, angka, simbol)",                                                       urutan: 4,  checklist: "Pass", keterangan: "" },
  { kategori: "Perlindungan Kata Sandi",  item_pengecekan: "Kata sandi admin dan akun pengguna default telah diubah",                                                                                        urutan: 5,  checklist: "Pass", keterangan: "" },
  { kategori: "Perangkat Lunak",          item_pengecekan: "Perangkat lunak yang diinstal telah sesuai dengan whitelist software yang dimiliki",                                                             urutan: 6,  checklist: "Pass", keterangan: "" },
  { kategori: "Perangkat Lunak",          item_pengecekan: "Antivirus dan anti-malware telah diinstal dan diperbarui",                                                                                       urutan: 7,  checklist: "Pass", keterangan: "" },
  { kategori: "Perangkat Lunak",          item_pengecekan: "Pengaturan pembaruan otomatis untuk aplikasi telah diaktifkan",                                                                                  urutan: 8,  checklist: "Pass", keterangan: "" },
  { kategori: "Kontrol Akses",            item_pengecekan: "Hak akses pengguna dibatasi (tidak semua pengguna memiliki hak admin) sesuai dengan matriks akses yang dimiliki",                               urutan: 9,  checklist: "Pass", keterangan: "" },
  { kategori: "Keamanan Fisik",           item_pengecekan: "Layar dikunci otomatis setelah 10 menit tidak digunakan",                                                                                        urutan: 10, checklist: "Pass", keterangan: "" },
  { kategori: "Penyimpanan",              item_pengecekan: "Batas maksimal penyimpanan 90% dari total ruang (storage) yang tersedia",                                                                        urutan: 11, checklist: "Pass", keterangan: "" },
];

export default function FormulirHardeningPage() {
  const router = useRouter();
  const { user, bidang } = useAuthStore();

  // State List & Filter
  const [items, setItems] = useState<SmkiFormulirHardening[]>([]);
  const [stats, setStats] = useState<HardeningStats>({
    total_formulir: 0,
    total_selesai: 0,
    total_proses: 0,
    total_menunggu: 0,
    total_draft: 0,
    avg_compliance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State Lookup Data
  const [lookupAssets, setLookupAssets] = useState<any[]>([]);
  const [defaultChecklists, setDefaultChecklists] = useState<HardeningChecklistItem[]>([]);
  const [suggestedNoDokumen, setSuggestedNoDokumen] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Active / Selected Form
  const [selectedForm, setSelectedForm] = useState<SmkiFormulirHardening | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Combobox Asset State
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const assetComboboxRef = useRef<HTMLDivElement>(null);

  // Export Dropdown State
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Form State (strictly matching Mockup)
  const [formData, setFormData] = useState<{
    no_dokumen: string;
    no_revisi: string;
    tanggal_terbit: string;
    aset_id: number | null;
    nomor_aset: string;
    jenis_aset: string;
    merek_tipe: string;
    lokasi: string;
    tanggal_check: string;
    status: "Selesai" | "Dalam Proses" | "Menunggu" | "Draft" | "";
    kota: string;
    tanggal_pengesahan: string;
    nama_auditor: string;
    checklists: HardeningChecklistItem[];
    is_auto_filled: boolean;
  }>({
    no_dokumen: "",
    no_revisi: "0.0",
    tanggal_terbit: new Date().toISOString().split("T")[0],
    aset_id: null,
    nomor_aset: "",
    jenis_aset: "",
    merek_tipe: "",
    lokasi: "",
    tanggal_check: "",
    status: "",
    kota: "",
    tanggal_pengesahan: "",
    nama_auditor: "",
    checklists: [],
    is_auto_filled: false,
  });

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assetComboboxRef.current && !assetComboboxRef.current.contains(event.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load Lookup Data
  const loadLookup = async () => {
    try {
      const res = await getSmkiFormulirHardeningLookup();
      if (res.success) {
        setLookupAssets(res.data.assets || []);
        setDefaultChecklists(res.data.default_checklists || []);
        setSuggestedNoDokumen(res.data.suggested_no_dokumen || "");
      }
    } catch (err) {
      console.error("Gagal memuat lookup hardening:", err);
    }
  };

  // Load Data List
  const loadData = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await getSmkiFormulirHardeningList({
        page,
        per_page: 10,
        search: search || undefined,
        jenis_aset: filterJenis || undefined,
        status: filterStatus || undefined,
      });

      if (res.success) {
        setItems(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.meta) {
          setCurrentPage(res.meta.current_page);
          setTotalPages(res.meta.last_page);
          setTotalItems(res.meta.total);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil daftar formulir hardening:", err);
      setToastMessage({ type: "error", text: "Gagal memuat daftar formulir hardening." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLookup();
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, filterJenis, filterStatus]);

  // Handle Pencarian
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData(1);
  };

  const handleResetFilter = () => {
    setSearch("");
    setFilterJenis("");
    setFilterStatus("");
    setCurrentPage(1);
    loadData(1);
  };

  // Buka Modal Tambah
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setAssetSearchQuery("");
    setIsAssetDropdownOpen(false);
    setFormData({
      no_dokumen: "",
      no_revisi: "0.0",
      tanggal_terbit: new Date().toISOString().split("T")[0],
      aset_id: null,
      nomor_aset: "",
      jenis_aset: "",
      merek_tipe: "",
      lokasi: "",
      tanggal_check: "",
      status: "",
      kota: "",
      tanggal_pengesahan: "",
      nama_auditor: "",
      checklists: defaultChecklists.length > 0
        ? JSON.parse(JSON.stringify(defaultChecklists))
        : JSON.parse(JSON.stringify(DEFAULT_CHECKLIST_TEMPLATE)),
      is_auto_filled: false,
    });
    setIsFormOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = async (item: SmkiFormulirHardening) => {
    setIsEditMode(true);
    setSelectedForm(item);
    setAssetSearchQuery("");
    setIsAssetDropdownOpen(false);
    try {
      const res = await getSmkiFormulirHardeningDetail(item.id);
      const detail = res.data;
      setFormData({
        no_dokumen: detail.no_dokumen,
        no_revisi: detail.no_revisi || "0.0",
        tanggal_terbit: detail.tanggal_terbit ? detail.tanggal_terbit.substring(0, 10) : new Date().toISOString().split("T")[0],
        aset_id: detail.aset_id || null,
        nomor_aset: detail.nomor_aset || "",
        jenis_aset: detail.jenis_aset || "Laptop/PC",
        merek_tipe: detail.merek_tipe || "",
        lokasi: detail.lokasi || "Bandung",
        tanggal_check: detail.tanggal_check ? detail.tanggal_check.substring(0, 10) : "",
        status: detail.status || "Dalam Proses",
        kota: detail.kota || "Bandung",
        tanggal_pengesahan: detail.tanggal_pengesahan ? detail.tanggal_pengesahan.substring(0, 10) : "",
        nama_auditor: detail.nama_auditor || "",
        checklists: detail.checklists && detail.checklists.length > 0
          ? JSON.parse(JSON.stringify(detail.checklists))
          : JSON.parse(JSON.stringify(defaultChecklists)),
        is_auto_filled: !!detail.aset_id,
      });
      setAssetSearchQuery(detail.nomor_aset || "");
      setIsFormOpen(true);
    } catch (err) {
      console.error("Gagal mengambil data detail:", err);
      setToastMessage({ type: "error", text: "Gagal mengambil data detail untuk diedit." });
    }
  };

  // Buka Modal Detail
  const handleOpenDetail = async (item: SmkiFormulirHardening) => {
    try {
      const res = await getSmkiFormulirHardeningDetail(item.id);
      setSelectedForm(res.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Gagal mengambil detail formulir:", err);
      setToastMessage({ type: "error", text: "Gagal mengambil detail formulir." });
    }
  };

  // Buka Modal Print & Ekspor
  const handleOpenPrintModal = async (item: SmkiFormulirHardening) => {
    try {
      const res = await getSmkiFormulirHardeningDetail(item.id);
      setSelectedForm(res.data);
      setIsPrintModalOpen(true);
    } catch (err) {
      console.error("Gagal mengambil detail untuk cetak:", err);
      setSelectedForm(item);
      setIsPrintModalOpen(true);
    }
  };

  // Pilih Aset dari Combobox Master
  const handleSelectAsset = (ast: any) => {
    setFormData((prev) => ({
      ...prev,
      aset_id: ast.id,
      nomor_aset: ast.nomor_aset,
      jenis_aset: ast.jenis_aset || prev.jenis_aset,
      merek_tipe: ast.merek_tipe || prev.merek_tipe,
      lokasi: ast.lokasi || prev.lokasi,
      is_auto_filled: true,
    }));
    setAssetSearchQuery(ast.nomor_aset);
    setIsAssetDropdownOpen(false);
  };

  // Mengetik Manual Nomor Aset
  const handleManualAssetInput = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      aset_id: null,
      nomor_aset: val,
      is_auto_filled: false,
    }));
    setAssetSearchQuery(val);
    setIsAssetDropdownOpen(true);
  };

  // Update Status Checklist Item
  const handleChecklistStatusChange = (index: number, status: "Pass" | "Fail") => {
    setFormData((prev) => {
      const updated = [...prev.checklists];
      updated[index] = { ...updated[index], checklist: status };
      return { ...prev, checklists: updated };
    });
  };

  // Update Keterangan Checklist Item
  const handleChecklistNoteChange = (index: number, note: string) => {
    setFormData((prev) => {
      const updated = [...prev.checklists];
      updated[index] = { ...updated[index], keterangan: note };
      return { ...prev, checklists: updated };
    });
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nomor_aset.trim()) {
      setToastMessage({ type: "error", text: "Nomor Aset wajib diisi." });
      return;
    }

    // Buat payload bersih — strip field UI-only dan ubah string kosong ke null/undefined
    const apiPayload: any = {
      nomor_aset:         formData.nomor_aset.trim(),
      no_revisi:          formData.no_revisi?.trim()  || undefined,
      tanggal_terbit:     formData.tanggal_terbit     || undefined,
      aset_id:            formData.aset_id            || undefined,
      jenis_aset:         formData.jenis_aset?.trim() || undefined,
      merek_tipe:         formData.merek_tipe?.trim() || undefined,
      lokasi:             formData.lokasi?.trim()     || undefined,
      tanggal_check:      formData.tanggal_check      || undefined,
      status:             formData.status             || undefined,
      kota:               formData.kota?.trim()       || undefined,
      tanggal_pengesahan: formData.tanggal_pengesahan || undefined,
      nama_auditor:       formData.nama_auditor?.trim()|| undefined,
      checklists:         formData.checklists.map((c, i) => ({
        id: c.id || undefined,
        kategori: c.kategori,
        item_pengecekan: c.item_pengecekan,
        urutan: c.urutan ?? (i + 1),
        checklist: c.checklist || "Pass",
        keterangan: c.keterangan || null,
      })),
    };

    // no_dokumen: hanya sertakan jika ada nilainya (pada edit mode atau jika diisi)
    if (formData.no_dokumen && formData.no_dokumen.trim()) {
      apiPayload.no_dokumen = formData.no_dokumen.trim();
    }

    setIsSubmitting(true);
    try {
      let resultId = selectedForm?.id;
      let finalDoc = formData.no_dokumen;
      if (isEditMode && selectedForm) {
        const res = await updateSmkiFormulirHardening(selectedForm.id, apiPayload);
        setToastMessage({ type: "success", text: "Formulir Hardening berhasil diperbarui." });
        resultId = res.data.id;
        finalDoc = res.data.no_dokumen;
      } else {
        const res = await createSmkiFormulirHardening(apiPayload);
        setToastMessage({ type: "success", text: "Formulir Hardening baru berhasil disimpan." });
        resultId = res.data.id;
        finalDoc = res.data.no_dokumen;
      }

      setIsFormOpen(false);
      loadData(currentPage);
      loadLookup();
    } catch (err: any) {
      console.error("Gagal menyimpan formulir hardening:", err.response?.data || err);
      const errData = err.response?.data;
      let msg = "Terjadi kesalahan saat menyimpan formulir.";
      if (errData?.errors) {
        const allMsgs = Object.entries(errData.errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join(" | ");
        msg = allMsgs || msg;
      } else if (errData?.message) {
        msg = errData.message;
      }
      setToastMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hapus Data
  const handleDeleteConfirm = async () => {
    if (!selectedForm) return;
    setIsSubmitting(true);
    try {
      await deleteSmkiFormulirHardening(selectedForm.id);
      setToastMessage({ type: "success", text: "Formulir Hardening berhasil dihapus." });
      setIsDeleteOpen(false);
      setIsDetailOpen(false);
      loadData(currentPage);
      loadLookup();
    } catch (err) {
      console.error("Gagal menghapus formulir:", err);
      setToastMessage({ type: "error", text: "Gagal menghapus formulir." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Unduh Dokumen Word Resmi FR-047
  const handleDownloadDocx = async (id: number, noDokumen: string) => {
    setIsExporting(id);
    setIsExportDropdownOpen(false);
    try {
      const blob = await exportSmkiFormulirHardeningDocx(id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      const cleanNo = noDokumen.replace(/[^a-zA-Z0-9_\-]/g, "_");
      link.setAttribute("download", `FR-047_Hardening_${cleanNo}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage({ type: "success", text: `Dokumen resmi FR-047 #${noDokumen} berhasil diunduh.` });
    } catch (err) {
      console.error("Gagal mengunduh dokumen FR-047:", err);
      setToastMessage({ type: "error", text: "Gagal mengunduh template dokumen resmi FR-047." });
    } finally {
      setIsExporting(null);
    }
  };

  // Trigger Print Browser (sebagai PDF)
  const handleTriggerPrint = () => {
    setIsExportDropdownOpen(false);
    window.print();
  };

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Selesai":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Selesai
          </span>
        );
      case "Dalam Proses":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Proses
          </span>
        );
      case "Menunggu":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Menunggu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
    }
  };

  // Helper Icon Kategori Checklist
  const getCategoryIcon = (kategori: string) => {
    switch (kategori) {
      case "Sistem Operasi": return <Cpu size={15} className="text-blue-500" />;
      case "Perlindungan Kata Sandi": return <Shield size={15} className="text-emerald-500" />;
      case "Perangkat Lunak": return <Lock size={15} className="text-indigo-500" />;
      case "Kontrol Akses": return <User size={15} className="text-cyan-500" />;
      case "Keamanan Fisik": return <Monitor size={15} className="text-amber-500" />;
      case "Penyimpanan": return <Database size={15} className="text-purple-500" />;
      default: return <CheckCircle2 size={15} className="text-blue-500" />;
    }
  };

  // Hitung nomor urut kategori
  const getCategoryNumber = (kategori: string): number => {
    const map: Record<string, number> = {
      "Sistem Operasi": 1,
      "Perlindungan Kata Sandi": 2,
      "Perangkat Lunak": 3,
      "Kontrol Akses": 4,
      "Keamanan Fisik": 5,
      "Penyimpanan": 6,
    };
    return map[kategori] || 1;
  };

  // Filter aset lookup
  const filteredLookupAssets = lookupAssets.filter((a) => {
    const q = assetSearchQuery.toLowerCase();
    if (!q) return true;
    return (
      a.nomor_aset?.toLowerCase().includes(q) ||
      a.nama_aset?.toLowerCase().includes(q) ||
      a.merek_tipe?.toLowerCase().includes(q)
    );
  });

  // Format tanggal untuk dokumen cetak
  const formatTanggalCetak = (tgl: string) => {
    if (!tgl) return "-";
    const d = new Date(tgl);
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Render komponen dokumen FR-047 resmi (Persis sama dengan format .docx FR-047)
  const renderPrintDocument = (doc: SmkiFormulirHardening) => (
    <div
      className="w-full bg-white text-black leading-normal"
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div className="p-6 sm:p-8">
        {/* ===== KOP SURAT FR-047 (Sesuai Header Template Word Resmi, Garis Rapi Tanpa Bocor) ===== */}
        <table
          className="w-full mb-3 text-center"
          style={{
            borderCollapse: "collapse",
            border: "1px solid #000000",
          }}
        >
          <tbody>
            <tr>
              {/* Kolom 1: Logo Diskominfo Jabar */}
              <td
                rowSpan={3}
                className="w-[18%] p-2 text-center align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
              >
                <img
                  src="/logo-fr047.png"
                  alt="Logo Diskominfo Jawa Barat"
                  className="w-16 h-auto object-contain mx-auto"
                />
              </td>

              {/* Kolom 2: Judul Dokumen */}
              <td
                rowSpan={3}
                className="w-[42%] p-2.5 text-center align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                  textAlign: "center",
                }}
              >
                <h2 className="text-sm font-bold tracking-normal text-black uppercase leading-tight">
                  FORMULIR HARDENING<br />PENGECEKAN ASET
                </h2>
              </td>

              {/* Metadata Baris 1: No. Dokumen */}
              <td
                className="w-[16%] px-2 py-1 text-[10px] text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                No. Dokumen
              </td>
              <td
                className="w-[4%] px-1 py-1 text-[10px] text-center align-middle"
                style={{
                  border: "1px solid #000000",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                :
              </td>
              <td
                className="w-[20%] px-2 py-1 text-[10px] font-mono text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                {doc.no_dokumen || "FR-047/KOM.03.05/SANDIKAMI"}
              </td>
            </tr>

            <tr>
              {/* Metadata Baris 2: No. Revisi */}
              <td
                className="px-2 py-1 text-[10px] text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                No. Revisi
              </td>
              <td
                className="px-1 py-1 text-[10px] text-center align-middle"
                style={{
                  border: "1px solid #000000",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                :
              </td>
              <td
                className="px-2 py-1 text-[10px] text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                {doc.no_revisi || "0.0"}
              </td>
            </tr>

            <tr>
              {/* Metadata Baris 3: Tanggal Terbit */}
              <td
                className="px-2 py-1 text-[10px] text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                Tanggal Terbit
              </td>
              <td
                className="px-1 py-1 text-[10px] text-center align-middle"
                style={{
                  border: "1px solid #000000",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                :
              </td>
              <td
                className="px-2 py-1 text-[10px] text-left align-middle"
                style={{
                  border: "1px solid #000000",
                  verticalAlign: "middle",
                }}
              >
                {doc.tanggal_terbit ? formatTanggalCetak(doc.tanggal_terbit) : "24 Oktober 2024"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== TABEL 0: METADATA ASET (Tepat 3 Baris Sesuai Template Word) ===== */}
        <table className="w-full border border-black mb-3 text-[11px] border-collapse">
          <tbody>
            <tr className="border-b border-black">
              <td className="w-32 p-1.5 border-r border-black">Nomor Aset</td>
              <td className="w-4 p-1.5 text-center border-r border-black">:</td>
              <td className="p-1.5 font-medium">{doc.nomor_aset || "-"}</td>
            </tr>
            <tr className="border-b border-black">
              <td className="p-1.5 border-r border-black">Jenis Aset*</td>
              <td className="p-1.5 text-center border-r border-black">:</td>
              <td className="p-1.5 font-medium">{doc.jenis_aset || "Laptop/PC"}</td>
            </tr>
            <tr>
              <td className="p-1.5 border-r border-black">Merek/Tipe</td>
              <td className="p-1.5 text-center border-r border-black">:</td>
              <td className="p-1.5 font-medium">{doc.merek_tipe || "-"}</td>
            </tr>
          </tbody>
        </table>

        {/* ===== TABEL 1: HARDENING CHECKLIST (Persis Sesuai Template Word) ===== */}
        <table className="w-full border border-black text-[10px] border-collapse mb-3">
          <thead>
            <tr className="border-b border-black font-bold">
              <th className="p-1.5 w-10 border-r border-black text-center font-bold">No</th>
              <th className="p-1.5 border-r border-black text-left font-bold">Pengecekan</th>
              <th className="p-1.5 w-20 border-r border-black text-center font-bold">Checklist</th>
              <th className="p-1.5 w-44 text-left font-bold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {doc.checklists?.map((item, idx) => {
              const isNewCategory = idx === 0 || doc.checklists![idx - 1].kategori !== item.kategori;
              const catNumber = getCategoryNumber(item.kategori);
              const isPass = ["pass", "sesuai", "ada", "1", "true", "ya"].includes(item.checklist?.toLowerCase().trim() || "");

              return (
                <Fragment key={idx}>
                  {/* Baris Header Kategori (Cell 0 ada nomor, Cell 1 nama kategori, Cell 2 & 3 kosong) */}
                  {isNewCategory && (
                    <tr className="border-b border-black font-bold">
                      <td className="p-1.5 text-center border-r border-black font-bold">{catNumber}</td>
                      <td className="p-1.5 font-bold border-r border-black">
                        {item.kategori}
                      </td>
                      <td className="p-1.5 border-r border-black"></td>
                      <td className="p-1.5"></td>
                    </tr>
                  )}
                  {/* Baris Sub-Item (Cell 0 kosong, Cell 1 teks item, Cell 2 checklist simbol, Cell 3 keterangan) */}
                  <tr className="border-b border-black">
                    <td className="p-1.5 text-center border-r border-black"></td>
                    <td className="p-1.5 border-r border-black">{item.item_pengecekan}</td>
                    <td className="p-1.5 border-r border-black text-center font-bold">
                      {isPass ? "✓" : "-"}
                    </td>
                    <td className="p-1.5">{item.keterangan || "-"}</td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {/* ===== SETELAH TABEL 1: CATATAN & PENGESAHAN (Persis Template Word FR-047) ===== */}
        <div className="flex justify-between items-start pt-1 text-[10px] leading-relaxed">
          {/* Sisi Kiri: Catatan Checklist Hardening & *Coret salah satu */}
          <div className="space-y-0.5">
            <div className="italic">Checklist hardening</div>
            <div className="italic text-[9px] text-black">*Coret salah satu</div>
          </div>

          {/* Sisi Kanan: Tempat/Tanggal & Specimen Pembuat / Auditor */}
          <div className="w-64 text-left pl-6">
            <div>
              {doc.kota || "Bandung"}, {formatTanggalCetak(doc.tanggal_pengesahan || doc.tanggal_check)}
            </div>
            <div className="mt-0.5">Specimen pembuat,</div>
            {/* Spasi Tanda Tangan */}
            <div className="h-14"></div>
            <div className="font-bold">( {doc.nama_auditor || "Tim IT Security"} )</div>
            {doc.nip_auditor && (
              <div className="text-[9px] text-black">NIP. {doc.nip_auditor}</div>
            )}
          </div>
        </div>

        {/* ===== FOOTER KLASIFIKASI & HALAMAN (Persis Template Word FR-047) ===== */}
        <div className="border-t border-black mt-8 pt-1 flex justify-between text-[9px] text-black">
          <span>Klasifikasi: INTERNAL</span>
          <span>Hal 1 dari 1 hal</span>
        </div>
      </div>
    </div>
  );

  return (
    <ServiceRouteGuard requiredService="SMKI">
      {/* Stylesheet Khusus Print */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
          }
          .no-print,
          .print\\:hidden,
          header,
          aside,
          nav {
            display: none !important;
          }
          #print-document-root {
            display: block !important;
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col gap-6 pb-12 no-print print:hidden">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-5 right-5 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border transition-all animate-in slide-in-from-top-3 ${toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800"
              }`}
          >
            {toastMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 1. Hero Banner matching Daftar Aset */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] p-6 sm:p-7 text-white shadow-lg">
          <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-40 -top-10 w-44 h-44 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                Formulir Hardening Pengecekan Aset
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Inventarisasi dan checklist kepatuhan hardening perangkat teknologi informasi (FR-047/KOM.03.05/SANDIKAMI) sesuai standar SMKI Diskominfo Jawa Barat.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Unit Kerja: <strong className="text-white">{bidang?.name || "Bidang Aplikasi Informatika"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <FileText size={16} className="text-teal-200" />
                <span>Format Standar: <strong className="text-teal-100">FR-047 (PDF &amp; Word .docx)</strong></span>
              </div>
            </div>
          </div>
        </div>



        {/* 3. Toolbar: Search, Filters & Action Buttons matching Daftar Aset */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="search-formulir"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setCurrentPage(1);
                    loadData(1);
                  }
                }}
                placeholder="Cari nomor dokumen, jenis aset, atau merek/tipe..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
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
                id="btn-tambah-formulir"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Formulir</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Jenis Aset:
              </label>
              <select
                id="filter-jenis"
                value={filterJenis}
                onChange={(e) => {
                  setFilterJenis(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Jenis Aset</option>
                <option value="Laptop/PC">Laptop/PC</option>
                <option value="Server">Server</option>
                <option value="Router">Router</option>
                <option value="Switch">Switch</option>
                <option value="Firewall">Firewall</option>
                <option value="Storage">Storage</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Status Audit:
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">Semua Status</option>
                <option value="Selesai">Selesai</option>
                <option value="Dalam Proses">Dalam Proses</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Draft">Draft</option>
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

        {/* 4. Data Table Container matching Daftar Aset */}
        <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header Info */}
          <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Daftar Formulir Hardening Pengecekan Aset SMKI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {totalItems} Data
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Menampilkan {items.length} dari {totalItems} data formulir
              </span>
              <button
                onClick={() => loadData(currentPage)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200/80 dark:border-slate-800 text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 min-w-[200px]">NO. DOKUMEN</th>
                  <th className="py-3 px-4 min-w-[130px]">JENIS ASET</th>
                  <th className="py-3 px-4 min-w-[180px]">MEREK / TIPE</th>
                  <th className="py-3 px-4 min-w-[130px]">TANGGAL CHECK</th>
                  <th className="py-3 px-4 text-center w-28">STATUS</th>
                  <th className="py-3 px-4 text-center w-36">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-emerald-600" />
                        <span className="font-medium text-xs">Memuat data formulir hardening...</span>
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <AlertCircle size={32} className="text-amber-500 mb-1" />
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                          Data Formulir Tidak Ditemukan
                        </span>
                        <p className="text-xs text-slate-400 text-center">
                          Tidak ada data formulir hardening yang cocok dengan filter atau kata kunci saat ini.
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
                    const rowNumber = (currentPage - 1) * 10 + (idx + 1);
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* NO: circular emerald badge like Daftar Aset */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="flex justify-center">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                              {rowNumber}
                            </span>
                          </div>
                        </td>

                        {/* NO. DOKUMEN */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs leading-tight">
                            {item.no_dokumen}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {item.nomor_aset ? `Aset: ${item.nomor_aset}` : "FR-047 Standard"}
                          </div>
                        </td>

                        {/* JENIS ASET: styled badge */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800">
                            {item.jenis_aset || "Laptop/PC"}
                          </span>
                        </td>

                        {/* MEREK / TIPE */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.merek_tipe || "-"}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.lokasi || "Diskominfo Jawa Barat"}
                          </div>
                        </td>

                        {/* TANGGAL CHECK */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                          {item.tanggal_check || "-"}
                        </td>

                        {/* STATUS */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          {renderStatusBadge(item.status)}
                        </td>

                        {/* AKSI BUTTONS (Detail, Cetak, Edit, Hapus) */}
                        <td className="py-3.5 px-4 text-center align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              id={`btn-detail-${item.id}`}
                              type="button"
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail Formulir"
                              className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200/80 dark:border-teal-800/60 transition-all cursor-pointer"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              id={`btn-print-${item.id}`}
                              type="button"
                              onClick={() => handleOpenPrintModal(item)}
                              title="Cetak & Ekspor Dokumen"
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/80 dark:border-emerald-800/60 transition-all cursor-pointer"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              id={`btn-edit-${item.id}`}
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              title="Ubah Data Formulir"
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200/80 dark:border-blue-800/60 transition-all cursor-pointer"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              id={`btn-delete-${item.id}`}
                              type="button"
                              onClick={() => { setSelectedForm(item); setIsDeleteOpen(true); }}
                              title="Hapus Formulir"
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

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Halaman {currentPage} dari {totalPages} (Menampilkan {(currentPage - 1) * 10 + 1} – {Math.min(currentPage * 10, totalItems)} dari {totalItems} data)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${currentPage === pg
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                      : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* MODAL FORM INPUT & EDIT                                       */}
        {/* ============================================================ */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-4xl my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[94vh] flex flex-col">
              {/* Header Banner — emerald gradient matching Daftar Aset */}
              <div className="px-6 py-3.5 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] border-b border-emerald-700/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-sm shadow-sm">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black tracking-tight text-white uppercase leading-none">
                      DISKOMINFO JAWA BARAT
                    </h4>
                    <p className="text-[9px] font-semibold text-emerald-200 uppercase tracking-widest mt-0.5">
                      SMKI · FORMULIR HARDENING PENGECEKAN ASET
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-emerald-100 uppercase leading-none">
                      {isEditMode ? "EDIT FORMULIR" : "TAMBAH FORMULIR BARU"}
                    </p>
                    <p className="text-[9px] text-emerald-300 mt-0.5 font-mono">
                      {formData.no_dokumen || "FR-047"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Green Sub-Bar (No Dokumen, No Revisi, Tanggal Terbit) */}
              <div className="bg-emerald-600/10 dark:bg-emerald-950/40 px-6 py-2 border-b border-emerald-500/20 text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold flex items-center justify-between flex-shrink-0 gap-4">
                <span className="whitespace-nowrap">
                  No. Dokumen: <strong className="font-mono text-emerald-950 dark:text-white">{formData.no_dokumen || (isEditMode ? "-" : suggestedNoDokumen || "(Otomatis)")}</strong>
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  No. Revisi:{" "}
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.no_revisi}
                      onChange={(e) => setFormData({ ...formData, no_revisi: e.target.value })}
                      className="w-14 px-1.5 py-0.5 text-[11px] font-mono rounded border border-emerald-400/60 bg-white/70 dark:bg-slate-800/70 text-emerald-950 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <strong className="font-mono text-emerald-950 dark:text-white">{formData.no_revisi || "0.0"}</strong>
                  )}
                </span>
                <span className="whitespace-nowrap">
                  Tanggal Terbit:{" "}
                  <strong className="font-mono text-emerald-950 dark:text-white">
                    {formData.tanggal_terbit
                      ? new Date(formData.tanggal_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                      : new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </strong>
                </span>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmitForm} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">

                {/* ========================= */}
                {/* SECTION 1: METADATA ASET */}
                {/* ========================= */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-[11px] font-extrabold tracking-wider text-[#0f2540] dark:text-blue-400 uppercase flex items-center gap-2">
                      <Database size={13} />
                      METADATA ASET &amp; DOKUMEN
                    </h4>
                    {formData.is_auto_filled && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ Auto-filled dari Master Aset
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                      {/* Nomor Dokumen (Edit Mode) */}
                      {isEditMode && (
                        <div className="flex items-center gap-3">
                          <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                            Nomor Dokumen <span className="text-red-500">*</span>
                          </label>
                          <span className="text-slate-400 font-bold">:</span>
                          <input
                            type="text"
                            id="input-no-dokumen"
                            required
                            value={formData.no_dokumen}
                            onChange={(e) => setFormData({ ...formData, no_dokumen: e.target.value })}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                        </div>
                      )}

                      {/* Nomor Aset (Combobox - bisa pilih dari dropdown atau ketik manual) */}
                      <div className="flex items-start gap-3" ref={assetComboboxRef}>
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0 pt-1.5">
                          Nomor Aset <span className="text-red-500">*</span>
                        </label>
                        <span className="text-slate-400 font-bold pt-1.5">:</span>
                        <div className="flex-1 relative">
                          <div className="flex items-center">
                            <input
                              type="text"
                              id="input-nomor-aset"
                              required
                              placeholder="Ketik nomor/nama aset atau pilih dari dropdown ▼"
                              value={assetSearchQuery || formData.nomor_aset}
                              onChange={(e) => handleManualAssetInput(e.target.value)}
                              onFocus={() => setIsAssetDropdownOpen(true)}
                              className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          {/* Dropdown Options */}
                          {isAssetDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between sticky top-0">
                                <span>PILIH DARI MASTER ASET TI</span>
                                <span className="text-blue-500 font-normal normal-case">atau ketik nomor manual ↑</span>
                              </div>
                              {filteredLookupAssets.length === 0 ? (
                                <div className="p-3 text-center text-slate-400 text-xs italic">
                                  {assetSearchQuery ? `Tidak ada aset yang cocok dengan "${assetSearchQuery}". Ketik manual OK.` : "Tidak ada data aset."}
                                </div>
                              ) : (
                                filteredLookupAssets.map((ast) => (
                                  <div
                                    key={ast.id}
                                    onClick={() => handleSelectAsset(ast)}
                                    className="p-2.5 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700 last:border-0"
                                  >
                                    <div className="font-bold text-blue-700 dark:text-blue-400 font-mono text-[11px]">
                                      {ast.nomor_aset}
                                    </div>
                                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">
                                      {ast.nama_aset} — <span className="text-slate-500">{ast.merek_tipe}</span>
                                    </div>
                                    {ast.lokasi && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        📍 {ast.lokasi.length > 60 ? ast.lokasi.substring(0, 60) + "..." : ast.lokasi}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Jenis Aset (Dropdown + bisa pilih) */}
                      <div className="flex items-center gap-3">
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          Jenis Aset
                        </label>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          id="input-jenis-aset"
                          value={formData.jenis_aset}
                          onChange={(e) => setFormData({ ...formData, jenis_aset: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">-- Pilih Jenis Aset --</option>
                          <option value="Laptop/PC">Laptop/PC</option>
                          <option value="Server">Server</option>
                          <option value="Router">Router</option>
                          <option value="Switch">Switch</option>
                          <option value="Firewall">Firewall</option>
                          <option value="Storage">Storage</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      {/* Merek / Tipe */}
                      <div className="flex items-center gap-3">
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          Merek / Tipe
                        </label>
                        <span className="text-slate-400 font-bold">:</span>
                        <input
                          type="text"
                          id="input-merek-tipe"
                          placeholder="Contoh: Dell Latitude 3420 / Cisco ASA 5506"
                          value={formData.merek_tipe}
                          onChange={(e) => setFormData({ ...formData, merek_tipe: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                      {/* Tanggal Check */}
                      <div className="flex items-center gap-3">
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          Tanggal Check
                        </label>
                        <span className="text-slate-400 font-bold">:</span>
                        <input
                          type="date"
                          id="input-tanggal-check"
                          value={formData.tanggal_check}
                          onChange={(e) => setFormData({ ...formData, tanggal_check: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Lokasi */}
                      <div className="flex items-center gap-3">
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          Lokasi
                        </label>
                        <span className="text-slate-400 font-bold">:</span>
                        <input
                          type="text"
                          id="input-lokasi"
                          placeholder="Contoh: Ruang Server Lt. 3 / Bidang APTIKA"
                          value={formData.lokasi}
                          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Status Audit */}
                      <div className="flex items-center gap-3">
                        <label className="w-36 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                          Status Audit
                        </label>
                        <span className="text-slate-400 font-bold">:</span>
                        <select
                          id="input-status"
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.value as "Selesai" | "Dalam Proses" | "Menunggu" | "Draft" | "",
                            })
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">-- Pilih Status --</option>
                          <option value="Dalam Proses">Dalam Proses</option>
                          <option value="Selesai">Selesai</option>
                          <option value="Menunggu">Menunggu</option>
                          <option value="Draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ======================================== */}
                {/* SECTION 2: HARDENING CHECKLIST ISO 27001 */}
                {/* ======================================== */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {/* Header Checklist */}
                  <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-extrabold tracking-wider text-[#0f2540] dark:text-blue-400 uppercase flex items-center gap-2">
                          <Shield size={13} />
                          HARDENING CHECKLIST
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold tracking-wider">
                          STANDAR ISO/IEC 27001:2022 · A.8 Technological Controls
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {formData.checklists.filter(c => c.checklist === "Pass").length} / {formData.checklists.length} Pass
                        </div>
                        {formData.checklists.length > 0 && (
                          <div className={`text-sm font-extrabold ${(formData.checklists.filter(c => c.checklist === "Pass").length / formData.checklists.length * 100) >= 90
                            ? "text-emerald-600" : "text-amber-600"
                            }`}>
                            {Math.round(formData.checklists.filter(c => c.checklist === "Pass").length / formData.checklists.length * 100)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0f2540] text-white text-[10px] font-bold uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-10 text-center text-white">NO</th>
                          <th className="py-2.5 px-4 text-white">ITEM PENGECEKAN HARDENING</th>
                          <th className="py-2.5 px-3 w-32 text-center text-white">PASS / FAIL</th>
                          <th className="py-2.5 px-4 w-64 text-white">KETERANGAN / OBSERVASI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {formData.checklists.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                              <ShieldAlert size={24} className="mx-auto mb-2 text-slate-300" />
                              <p>Belum ada item checklist.</p>
                            </td>
                          </tr>
                        ) : (
                          formData.checklists.map((check, idx) => {
                            const isNewCategory = idx === 0 || formData.checklists[idx - 1].kategori !== check.kategori;
                            const catNumber = getCategoryNumber(check.kategori);

                            return (
                              <Fragment key={idx}>
                                {/* Header Kategori */}
                                {isNewCategory && (
                                  <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-t-2 border-slate-200 dark:border-slate-700">
                                    <td className="py-2 px-3 text-center font-bold text-[#0f2540] dark:text-blue-300 text-xs">
                                      {catNumber}
                                    </td>
                                    <td colSpan={3} className="py-2 px-4">
                                      <div className="flex items-center gap-2 font-extrabold tracking-wider uppercase text-[#0f2540] dark:text-white text-xs">
                                        {getCategoryIcon(check.kategori)}
                                        <span>{check.kategori}</span>
                                      </div>
                                    </td>
                                  </tr>
                                )}

                                {/* Sub-Item Checklist */}
                                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="py-2.5 px-3 text-center text-slate-300 dark:text-slate-600 text-[10px]">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                      {check.item_pengecekan}
                                    </span>
                                  </td>

                                  {/* Kolom PASS / FAIL */}
                                  <td className="py-2.5 px-3 align-middle">
                                    <div className="flex flex-col gap-1.5 items-start justify-center pl-2">
                                      <label
                                        onClick={() => handleChecklistStatusChange(idx, "Pass")}
                                        className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-600"
                                      >
                                        <div
                                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${check.checklist === "Pass"
                                            ? "bg-emerald-600 border-emerald-600 text-white"
                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                            }`}
                                        >
                                          {check.checklist === "Pass" && <Check size={11} strokeWidth={3} />}
                                        </div>
                                        <span>Pass</span>
                                      </label>

                                      <label
                                        onClick={() => handleChecklistStatusChange(idx, "Fail")}
                                        className="flex items-center gap-2 cursor-pointer select-none text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600"
                                      >
                                        <div
                                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${check.checklist === "Fail"
                                            ? "bg-red-600 border-red-600 text-white"
                                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                            }`}
                                        >
                                          {check.checklist === "Fail" && <Check size={11} strokeWidth={3} />}
                                        </div>
                                        <span>Fail</span>
                                      </label>
                                    </div>
                                  </td>

                                  {/* Kolom Keterangan */}
                                  <td className="py-2.5 px-4">
                                    <input
                                      type="text"
                                      value={check.keterangan || ""}
                                      onChange={(e) => handleChecklistNoteChange(idx, e.target.value)}
                                      placeholder="Keterangan / Observasi..."
                                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                    />
                                  </td>
                                </tr>
                              </Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Catatan Kaki ISO */}
                  <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-2 text-[10px] text-slate-400">
                    <Info size={12} className="flex-shrink-0" />
                    <span>
                      Referensi: ISO/IEC 27001:2022 Annex A — A.8.8 Management of technical vulnerabilities · A.8.19 Installation of software on operational systems
                    </span>
                  </div>
                </div>

                {/* ============================= */}
                {/* SECTION 3: PENGESAHAN AUDITOR */}
                {/* ============================= */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-[11px] font-extrabold tracking-wider text-[#0f2540] dark:text-blue-400 uppercase flex items-center gap-2">
                      <User size={13} />
                      PENGESAHAN AUDITOR
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Kiri: Kota & Tanggal Pengesahan */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                          Kota &amp; Tanggal Pengesahan
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            id="input-kota"
                            value={formData.kota}
                            onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                            placeholder="Bandung"
                            className="w-28 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                          <span className="text-slate-400 font-bold">,</span>
                          <input
                            type="date"
                            id="input-tanggal-pengesahan"
                            value={formData.tanggal_pengesahan}
                            onChange={(e) => setFormData({ ...formData, tanggal_pengesahan: e.target.value })}
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kanan: Nama Auditor */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                          Nama Auditor / Specimen Pembuat
                        </label>
                        <input
                          type="text"
                          id="input-nama-auditor"
                          value={formData.nama_auditor}
                          onChange={(e) => setFormData({ ...formData, nama_auditor: e.target.value })}
                          placeholder="Nama Auditor / Tim IT Security"
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="text-[11px] text-slate-400 font-medium">
                    * Periksa kembali kelengkapan seluruh item checklist sebelum menyimpan.
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                    >
                      ✕ BATAL
                    </button>

                    <button
                      id="btn-simpan-formulir"
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "MENYIMPAN..."
                        : isEditMode
                          ? "✓ SIMPAN PERUBAHAN"
                          : "✓ SIMPAN FORMULIR"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL DETAIL VIEW                                             */}
        {/* ============================================================ */}
        {isDetailOpen && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-6xl my-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40 flex-shrink-0">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    SMKI · Formulir Hardening · Detail Formulir
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedForm.no_dokumen}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDetailOpen(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsDetailOpen(false); handleOpenEdit(selectedForm); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsDetailOpen(false); handleOpenPrintModal(selectedForm); }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-500/20"
                  >
                    <Printer size={13} />
                    <span>Cetak &amp; Ekspor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`px-6 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${selectedForm.status === "Selesai"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                }`}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>
                    <strong>STATUS: {selectedForm.status.toUpperCase()}</strong> — Formulir Hardening Pengecekan Aset
                  </span>
                </div>
                {renderStatusBadge(selectedForm.status)}
              </div>

              {/* Content Grid */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-slate-50/50 dark:bg-slate-950/40">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Metadata & Ringkasan Hasil */}
                  <div className="lg:col-span-4 space-y-5">
                    {/* Card Metadata Aset & Dokumen */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        METADATA ASET &amp; DOKUMEN
                      </h4>
                      <div className="space-y-3.5">
                        {/* Nomor Dokumen */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            NOMOR DOKUMEN
                          </span>
                          <div className="flex items-center gap-2 font-mono font-bold text-xs text-slate-800 dark:text-white">
                            <FileText size={14} className="text-slate-400 flex-shrink-0" />
                            <span>{selectedForm.no_dokumen}</span>
                          </div>
                        </div>

                        {/* Jenis Aset */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            JENIS ASET
                          </span>
                          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                            <Laptop size={14} className="text-slate-400 flex-shrink-0" />
                            <span>{selectedForm.jenis_aset || "-"}</span>
                          </div>
                        </div>

                        {/* Merek / Tipe */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            MEREK / TIPE
                          </span>
                          <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 pl-0">
                            {selectedForm.merek_tipe || "-"}
                          </div>
                        </div>

                        {/* Tanggal Check */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            TANGGAL CHECK
                          </span>
                          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <span>
                              {selectedForm.tanggal_check
                                ? new Date(selectedForm.tanggal_check).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </div>

                        {/* Lokasi */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            LOKASI
                          </span>
                          <div className="flex items-start gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
                            <span className="text-slate-400 text-xs mt-0.5">📍</span>
                            <span>{selectedForm.lokasi || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Ringkasan Hasil */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                      <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        RINGKASAN HASIL
                      </h4>

                      <div className="space-y-3">
                        {/* Compliance Rate */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              COMPLIANCE RATE
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              {Math.round(selectedForm.compliance_rate || 0)}%
                            </span>
                          </div>
                        </div>

                        {/* Items Passed */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center flex-shrink-0">
                            <Check size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              ITEMS PASSED
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              {selectedForm.items_passed} / {selectedForm.checklists?.length || 11}
                            </span>
                          </div>
                        </div>

                        {/* Items Failed */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={20} strokeWidth={2.5} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              ITEMS FAILED
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              {selectedForm.items_failed}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hardening Checklist Table & Pengesahan Auditor */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Hardening Checklist Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-[#0b5cb5]" />
                          <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-slate-900 dark:text-white">
                            HARDENING CHECKLIST
                          </h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Dokumen Ref: {selectedForm.no_dokumen}
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#0b5cb5] text-white text-[10px] font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-10 text-center text-white">NO</th>
                              <th className="py-2.5 px-4 text-white">ITEM PENGECEKAN HARDENING</th>
                              <th className="py-2.5 px-4 w-36 text-center text-white">PASS / FAIL</th>
                              <th className="py-2.5 px-4 w-44 text-white">KETERANGAN</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                            {(() => {
                              if (!selectedForm.checklists || selectedForm.checklists.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={4} className="py-8 text-center text-slate-400">
                                      Tidak ada data checklist.
                                    </td>
                                  </tr>
                                );
                              }

                              // Kelompokkan checklist berdasarkan kategori
                              const groups: {
                                kategori: string;
                                catNumber: number;
                                items: HardeningChecklistItem[];
                              }[] = [];
                              const map = new Map<string, HardeningChecklistItem[]>();

                              for (const it of selectedForm.checklists) {
                                if (!map.has(it.kategori)) map.set(it.kategori, []);
                                map.get(it.kategori)!.push(it);
                              }

                              for (const [kat, list] of map.entries()) {
                                groups.push({
                                  kategori: kat,
                                  catNumber: getCategoryNumber(kat),
                                  items: list,
                                });
                              }
                              groups.sort((a, b) => a.catNumber - b.catNumber);

                              return groups.map((grp) => (
                                <tr
                                  key={grp.kategori}
                                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                  {/* NO */}
                                  <td className="py-3 px-3 text-center align-top font-bold text-slate-500 dark:text-slate-400 text-xs">
                                    {grp.catNumber}
                                  </td>

                                  {/* ITEM PENGECEKAN HARDENING */}
                                  <td className="py-3 px-4 align-top">
                                    <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider text-[#0b5cb5] dark:text-blue-400 mb-2">
                                      {getCategoryIcon(grp.kategori)}
                                      <span>{grp.kategori}</span>
                                    </div>
                                    <div className="space-y-2 pl-0.5">
                                      {grp.items.map((sub, i) => (
                                        <div
                                          key={i}
                                          className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2 h-6"
                                        >
                                          <span className="text-slate-400 mt-0.5 text-xs">•</span>
                                          <span className="truncate">{sub.item_pengecekan}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </td>

                                  {/* PASS / FAIL */}
                                  <td className="py-3 px-4 align-top">
                                    <div className="h-5 mb-2" />
                                    <div className="space-y-2">
                                      {grp.items.map((sub, i) => {
                                        const isPass = sub.checklist === "Pass";
                                        return (
                                          <div
                                            key={i}
                                            className="flex items-center justify-center gap-3 h-6 text-[11px] font-semibold"
                                          >
                                            <span
                                              className={`inline-flex items-center gap-1.5 ${
                                                isPass
                                                  ? "text-blue-700 dark:text-blue-400 font-bold"
                                                  : "text-slate-400 dark:text-slate-500 font-normal"
                                              }`}
                                            >
                                              <span
                                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] ${
                                                  isPass
                                                    ? "bg-[#0b5cb5] text-white"
                                                    : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                }`}
                                              >
                                                {isPass && "✓"}
                                              </span>
                                              Pass
                                            </span>

                                            <span
                                              className={`inline-flex items-center gap-1.5 ${
                                                !isPass
                                                  ? "text-red-600 dark:text-red-400 font-bold"
                                                  : "text-slate-400 dark:text-slate-500 font-normal"
                                              }`}
                                            >
                                              <span
                                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[9px] ${
                                                  !isPass
                                                    ? "bg-red-600 text-white"
                                                    : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                                                }`}
                                              >
                                                {!isPass && "✕"}
                                              </span>
                                              Fail
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </td>

                                  {/* KETERANGAN */}
                                  <td className="py-3 px-4 align-top">
                                    <div className="h-5 mb-2" />
                                    <div className="space-y-2">
                                      {grp.items.map((sub, i) => (
                                        <div key={i} className="h-6 flex items-center">
                                          {sub.keterangan ? (
                                            <div className="w-full px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium truncate">
                                              {sub.keterangan}
                                            </div>
                                          ) : (
                                            <div className="w-full px-2.5 py-0.5 rounded border border-slate-100 dark:border-slate-800 bg-transparent text-[11px] text-slate-300 dark:text-slate-600 truncate">
                                              -
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pengesahan Auditor */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                      <h4 className="text-[11px] font-extrabold tracking-wider text-slate-800 dark:text-white uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                        PENGESAHAN AUDITOR
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                        {/* Kiri: Kota & Tanggal */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            KOTA &amp; TANGGAL
                          </span>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {selectedForm.kota || "Bandung"}, {formatTanggalCetak(selectedForm.tanggal_pengesahan || selectedForm.tanggal_check)}
                          </span>
                        </div>

                        {/* Kanan: Spesimen Pembuat / Auditor */}
                        <div>
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">
                            SPESIMEN PEMBUAT / AUDITOR
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {selectedForm.nama_auditor || "Tim IT Security"}
                          </span>
                          {selectedForm.nip_auditor && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono mt-0.5">
                              {selectedForm.jabatan_auditor ? `${selectedForm.jabatan_auditor.toUpperCase()} / ` : ""}NIP. {selectedForm.nip_auditor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Info: Legend & Update info */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 pt-1 px-1">
                      <div className="flex items-center gap-4 font-semibold">
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <span className="w-2 h-2 rounded-full bg-[#0b5cb5]" />
                          Lulus Hardening
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Perlu Perbaikan
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span>
                          Terakhir diperbarui:{" "}
                          {selectedForm.updated_at
                            ? new Date(selectedForm.updated_at).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }) +
                              " " +
                              new Date(selectedForm.updated_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) +
                              " WIB"
                            : "-"}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          ISO/IEC 27001:2022 Compliant
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL CETAK & EKSPOR                                          */}
        {/* ============================================================ */}
        {isPrintModalOpen && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-4xl my-6 bg-slate-100 dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[95vh] flex flex-col">

              {/* Toolbar Cetak & Ekspor */}
              <div className="no-print px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#064e3b] to-[#059669] flex items-center justify-center text-white">
                    <Printer size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                      Cetak &amp; Ekspor Dokumen Resmi
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{selectedForm.no_dokumen}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {/* Tombol Cetak Langsung */}
                  <button
                    id="btn-print-direct"
                    type="button"
                    onClick={handleTriggerPrint}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
                    title="Cetak langsung dokumen formulir atau simpan sebagai PDF"
                  >
                    <Printer size={14} />
                    <span>Cetak Formulir</span>
                  </button>

                  {/* Dropdown Ekspor */}
                  <div className="relative" ref={exportDropdownRef}>
                    <button
                      id="btn-ekspor-dropdown"
                      type="button"
                      onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f2540] hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all border border-slate-700/50"
                    >
                      <FileDown size={13} />
                      <span>Ekspor Dokumen</span>
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${isExportDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExportDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1.5 w-56 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                        {/* Download Word */}
                        <button
                          type="button"
                          id="btn-download-word"
                          onClick={() => {
                            setIsExportDropdownOpen(false);
                            handleDownloadDocx(selectedForm.id, selectedForm.no_dokumen);
                          }}
                          disabled={isExporting === selectedForm.id}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
                            {isExporting === selectedForm.id ? (
                              <RefreshCw size={14} className="text-blue-600 animate-spin" />
                            ) : (
                              <FileDown size={14} className="text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">
                              {isExporting === selectedForm.id ? "Mengunduh..." : "Download Word (.docx)"}
                            </div>
                            <div className="text-[10px] text-slate-400">Template FR-047 resmi terisi</div>
                          </div>
                        </button>

                        {/* Cetak / PDF */}
                        <button
                          type="button"
                          onClick={handleTriggerPrint}
                          className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center flex-shrink-0">
                            <Printer size={14} className="text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-white">Cetak Dokumen / PDF</div>
                            <div className="text-[10px] text-slate-400">Dialog print &amp; simpan PDF</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Document Container (Preview Dokumen Resmi) */}
              <div className="p-4 sm:p-8 overflow-y-auto flex-1 flex justify-center bg-slate-200/70 dark:bg-slate-950/80">
                <div
                  className="w-full max-w-3xl bg-white text-black shadow-2xl border border-slate-300 font-sans text-xs leading-normal"
                  style={{ minHeight: "1050px", backgroundColor: "#ffffff", color: "#000000" }}
                >
                  {renderPrintDocument(selectedForm)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL KONFIRMASI HAPUS                                        */}
        {/* ============================================================ */}
        {isDeleteOpen && selectedForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto">
                <Trash2 size={22} className="text-red-600" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                Hapus Formulir Hardening?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data formulir <strong className="text-slate-800 dark:text-white">{selectedForm.no_dokumen}</strong> akan dihapus permanen dan tidak dapat dikembalikan.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  id="btn-batal-hapus"
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  id="btn-konfirmasi-hapus"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md shadow-red-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Print Sheet for Browser Print & PDF Export (A4) */}
      {selectedForm && (
        <div id="print-document-root" className="hidden print:block bg-white text-black font-sans text-xs">
          {renderPrintDocument(selectedForm)}
        </div>
      )}
    </ServiceRouteGuard>
  );
}

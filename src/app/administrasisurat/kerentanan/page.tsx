"use client";

import { useEffect, useState } from "react";
import { 
  TriangleAlert, Eye, Edit, Trash2, Plus, Search, Download, 
  ArrowLeft, Printer, Paperclip, FileText, X
} from "lucide-react";
import { 
  getKerentananList, deleteKerentanan, createKerentanan, 
  updateKerentanan, exportKerentanan 
} from "@/services/api";
import { Pagination } from "@/components/ui/Pagination";
import { RichTextEditor, FormattedContentViewer } from "@/components/ui/RichTextEditor";
import { showToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

const getSeverityBadge = (level?: string) => {
  const norm = (level || "").toLowerCase();
  if (norm.includes("kritis") || norm.includes("critical")) {
    return "bg-purple-100 text-purple-800 border border-purple-200";
  }
  if (norm.includes("tinggi") || norm.includes("high")) {
    return "bg-red-100 text-red-700 border border-red-200";
  }
  if (norm.includes("sedang") || norm.includes("medium")) {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  return "bg-emerald-100 text-emerald-700 border border-emerald-200";
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const cleanStr = String(dateString).split("T")[0].split(" ")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(year, month, day);
        return date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch (e) {
    console.error(e);
  }
  return dateString;
};

const SEVERITY_OPTIONS = ["Kritis", "Tinggi", "Sedang", "Rendah"];

export default function KerentananPage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // View states: 'list' | 'form' | 'preview'
  const [viewState, setViewState] = useState<"list" | "form" | "preview">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Preview State
  const [previewItem, setPreviewItem] = useState<any>(null);

  // Form states
  const [aplikasi, setAplikasi] = useState("");
  const [url, setUrl] = useState("");
  const [tingkatKerentanan, setTingkatKerentanan] = useState("Tinggi");
  const [perihal, setPerihal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [isiLampiran, setIsiLampiran] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("DRAF");
  const [lampiranFile, setLampiranFile] = useState<File | null>(null);
  const [existingLampiran, setExistingLampiran] = useState<{ nama: string; url: string } | null>(null);
  const [hapusLampiran, setHapusLampiran] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getKerentananList({
        search,
        status: statusFilter,
        page: currentPage,
        per_page: itemsPerPage,
      });
      if (res?.success) {
        setItems(res.data || []);
        setTotalPages(res.meta?.last_page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch Kerentanan data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (viewState === "list") {
      fetchData();
    }
  }, [currentPage, search, statusFilter, viewState]);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteKerentanan(deleteId);
      showToast.success("Peringatan kerentanan berhasil dihapus.");
      fetchData();
    } catch (error: any) {
      showToast.error(error?.response?.data?.message || "Gagal menghapus data kerentanan.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const handleOpenForm = (mode: "create" | "edit", data?: any) => {
    setFormMode(mode);
    if (mode === "edit" && data) {
      setSelectedId(data.id);
      setAplikasi(data.aplikasi || "");
      setUrl(data.url || "");
      setTingkatKerentanan(data.tingkat_kerentanan || "Tinggi");
      setPerihal(data.perihal || "");
      setDeskripsi(data.deskripsi || "");
      setIsiLampiran(data.isi_lampiran || "");
      setTanggal(data.tanggal ? data.tanggal.split("T")[0] : "");
      setStatus(data.status || "DRAF");
      setLampiranFile(null);
      setHapusLampiran(false);
      if (data.lampiran && data.lampiran_nama) {
        setExistingLampiran({ nama: data.lampiran_nama, url: data.lampiran_url || "" });
      } else {
        setExistingLampiran(null);
      }
    } else {
      setSelectedId(null);
      setAplikasi("");
      setUrl("");
      setTingkatKerentanan("Tinggi");
      setPerihal("Pemberitahuan Celah Keamanan (Vulnerability Advisory)");
      setDeskripsi("");
      setIsiLampiran("");
      setTanggal(new Date().toISOString().split("T")[0]);
      setStatus("DRAF");
      setLampiranFile(null);
      setExistingLampiran(null);
      setHapusLampiran(false);
    }
    setViewState("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!aplikasi.trim()) {
      showToast.error("Nama aplikasi wajib diisi.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("aplikasi", aplikasi);
      formData.append("url", url);
      formData.append("tingkat_kerentanan", tingkatKerentanan);
      formData.append("perihal", perihal);
      formData.append("deskripsi", deskripsi);
      formData.append("isi_lampiran", isiLampiran);
      formData.append("tanggal", tanggal);
      formData.append("status", status);
      if (lampiranFile) {
        formData.append("lampiran", lampiranFile);
      }
      if (hapusLampiran) {
        formData.append("hapus_lampiran", "1");
      }

      if (formMode === "create") {
        await createKerentanan(formData);
        showToast.success("Peringatan kerentanan berhasil ditambahkan.");
      } else if (formMode === "edit" && selectedId) {
        await updateKerentanan(selectedId, formData);
        showToast.success("Peringatan kerentanan berhasil diperbarui.");
      }

      setViewState("list");
      fetchData();
    } catch (error: any) {
      const serverMsg = error?.response?.data?.message || (error?.response?.data?.errors ? Object.values(error.response.data.errors).flat().join(", ") : null);
      showToast.error(`Gagal menyimpan data: ${serverMsg || error?.message || "Terjadi kesalahan pada server"}`);
      console.error("Save error:", error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportKerentanan({ status: statusFilter });
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `pemberitahuan_kerentanan_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Gagal mendownload export data.");
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "kritis":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "tinggi":
        return "bg-red-100 text-red-800 border border-red-200";
      case "sedang":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border border-blue-200";
    }
  };

  if (!mounted) return null;

  // Preview View Render
  if (viewState === "preview" && previewItem) {
    return (
      <div suppressHydrationWarning className="flex flex-col gap-6 max-w-[1200px] mx-auto font-sans bg-slate-100 min-h-screen p-4 md:p-6 pb-20 print:p-0 print:bg-white">
        {/* Top bar (Hidden when printing) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewState("list")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Kembali ke Daftar"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">Detail Peringatan Kerentanan</h2>
              <p className="text-xs text-slate-500">{previewItem.nomor_surat}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Printer size={14} /> Cetak Surat
            </button>
            <button
              onClick={() => setViewState("list")}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors"
            >
              Kembali
            </button>
          </div>
        </div>

        {/* Printable Multi-Page Document Container */}
        <div className="flex flex-col items-center gap-8 py-4 print:gap-0 print:py-0 print:block print:w-full">
          
          {/* PAGE 1: Surat Utama */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg border border-slate-200 mx-auto relative flex flex-col justify-between print:shadow-none print:border-none print:p-[20mm] print:w-full print:min-h-0 print:h-auto print:mx-auto print-page-break font-sans">
            <div>
              {/* Kop Surat Pemprov Jabar */}
              <div className="flex items-center border-b-[3px] border-double border-slate-900 pb-3 mb-6">
                {/* SVG Logo Pemprov Jawa Barat */}
                <div className="w-16 h-16 mr-4 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L85 25 L85 65 C85 80, 65 92, 50 95 C35 92, 15 80, 15 65 L15 25 Z" fill="#1b5e20" />
                    <path d="M50 12 L78 30 L78 63 C78 75, 62 85, 50 88 C38 85, 22 75, 22 63 L22 30 Z" fill="#ffeb3b" />
                    <circle cx="50" cy="50" r="18" fill="#1565c0" />
                    <path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="4" />
                  </svg>
                </div>
                <div className="flex-1 text-center font-sans">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">PEMERINTAH DAERAH PROVINSI JAWA BARAT</h3>
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">DINAS KOMUNIKASI DAN INFORMATIKA</h2>
                  <p className="text-[10px] text-slate-700">Jalan Tamansari No. 55 Telepon (022) 2502898 Faksimile (022) 2511505</p>
                  <p className="text-[10px] text-slate-700">website : http://diskominfo.jabarprov.go.id ; email : diskominfo@jabarprov.go.id</p>
                  <p className="text-[10px] font-bold text-slate-800 tracking-widest uppercase">B A N D U N G   40132</p>
                </div>
              </div>

              {/* Date and Destination Header */}
              <div className="flex justify-between items-start mb-6 text-xs text-slate-900 font-sans">
                {/* Left Column: Metadata */}
                <table className="text-xs text-slate-900 border-collapse">
                  <tbody>
                    <tr className="align-top">
                      <td className="w-20 py-0.5 font-normal">Nomor</td>
                      <td className="w-3 py-0.5 text-center">:</td>
                      <td className="py-0.5 font-normal">{previewItem.nomor_surat || "…/KOM.03.01.08/APTIKA"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-0.5 font-normal">Sifat</td>
                      <td className="text-center">:</td>
                      <td className="py-0.5 font-normal capitalize">{previewItem.sifat_surat || "Penting"}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-0.5 font-normal">Lampiran</td>
                      <td className="text-center">:</td>
                      <td className="py-0.5 font-normal">{previewItem.lampiran_nama ? "1 (satu) Berkas" : (previewItem.lampiran || "1 (satu) Berkas")}</td>
                    </tr>
                    <tr className="align-top">
                      <td className="py-0.5 font-normal">Hal</td>
                      <td className="text-center">:</td>
                      <td className="py-0.5 font-bold text-slate-900 max-w-[240px] leading-tight">
                        {previewItem.perihal || `Pemberitahuan Kerentanan Aplikasi (${previewItem.tingkat_kerentanan || "Sensitive Data Exposure"})`}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Right Column: Date & Kepada */}
                <div className="text-left max-w-[260px] text-xs text-slate-900 leading-snug space-y-1">
                  <p className="mb-2 text-xs text-slate-900">
                    Bandung, {formatDate(previewItem.tanggal)}
                  </p>
                  <p>Kepada</p>
                  <p className="font-semibold">Yth. {previewItem.tujuan || "Direktur Rumah Sakit Jiwa"}</p>
                  <p className="pl-4">Provinsi Jawa Barat</p>
                  <p className="pt-1">di</p>
                  <p className="tracking-widest font-bold pl-4">T E M P A T</p>
                </div>
              </div>

              {/* Letter Content Body */}
              <div className="text-xs text-slate-900 leading-relaxed text-justify space-y-4 font-sans">
                <p>
                  Dalam upaya meningkatkan keamanan informasi, Kami telah melaksanakan kegiatan monitoring proaktif terhadap aplikasi sub domain jabarprov.go.id milik Perangkat Daerah di lingkungan Pemerintah Daerah Provinsi Jawa Barat. Berdasarkan hasil kegiatan tersebut kami menemukan kerentanan <span className="font-semibold">{previewItem.tingkat_kerentanan || "Sensitive Data Exposure"}</span> yaitu kondisi ketika data sensitif, khususnya data pribadi pengguna atau individu dapat diakses tanpa pembatasan yang memadai oleh pihak yang tidak berwenang. Rincian hasil temuan dimaksud dijelaskan sebagaimana terlampir.
                </p>
                <p>
                  Guna menjaga keamanan data dan memastikan perlindungan informasi pribadi sesuai amanat Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, agar Saudara melakukan perbaikan dalam waktu 14 (empat belas) hari kerja terhadap temuan kerentanan tersebut dan melaporkan kembali hasil perbaikan sesuai dengan rekomendasi terlampir. Untuk koordinasi dan informasi lebih lanjut dapat menghubungi narahubung Sdr. Mohammad Ibrohim, S.Kom., M.Kom. (Hp/WA .08121328930).
                </p>
                <p>
                  Demikian disampaikan, atas perhatian dan kerja samanya diucapkan terima kasih.
                </p>
              </div>
            </div>

            {/* Bottom Signature & Tembusan */}
            <div>
              <div className="flex justify-end mt-8">
                <div className="text-center w-80 text-xs text-slate-900 font-sans">
                  <p className="font-bold uppercase leading-tight">
                    KEPALA DINAS KOMUNIKASI DAN INFORMATIKA
                  </p>
                  <p className="font-bold uppercase leading-tight mb-3">
                    PROVINSI JAWA BARAT,
                  </p>

                  {/* TTE Box matching PDF */}
                  <div className="my-3 border border-slate-400 rounded-lg p-2.5 bg-slate-50/40 flex items-center gap-3 text-left">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100/50 rounded">
                      <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 5 L85 25 L85 65 C85 80, 65 92, 50 95 C35 92, 15 80, 15 65 L15 25 Z" fill="#1565c0" />
                        <circle cx="50" cy="50" r="14" fill="#ffeb3b" />
                      </svg>
                    </div>
                    <div className="text-[9px] leading-tight text-slate-800">
                      <p className="text-[8px] text-slate-500">Ditandatangani secara elektronik oleh:</p>
                      <p className="font-bold uppercase text-[9px] mt-0.5">KEPALA DINAS KOMUNIKASI DAN INFORMATIKA</p>
                      <p className="font-bold uppercase text-[9px]">PROVINSI JAWA BARAT</p>
                      <p className="font-bold mt-1 text-[9.5px]">MAS ADI KOMAR, S.STP., M.Tr.A.P</p>
                      <p className="text-slate-600 text-[8.5px]">Pembina TK.I</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tembusan Footer */}
              <div className="mt-6 text-xs text-slate-900 border-t border-slate-200 pt-3 font-sans">
                <p>Tembusan : {previewItem.tembusan || "Kepala Dinas Kesehatan Provinsi Jawa Barat"}</p>
              </div>
            </div>
          </div>

          {/* PAGE 2: Lampiran Rincian & Rekomendasi */}
          <div className="w-[210mm] min-h-[297mm] bg-white p-[25mm] shadow-lg border border-slate-200 mx-auto relative flex flex-col justify-between print:shadow-none print:border-none print:p-[20mm] print:w-full print:min-h-0 print:h-auto print:mx-auto font-sans">
            <div>
              {/* Attachment Header Metadata (Right-aligned) */}
              <div className="flex justify-end mb-8 font-sans text-xs text-slate-900">
                <div className="w-auto max-w-[420px]">
                  <p className="font-normal text-slate-900 mb-1 leading-tight">
                    LAMPIRAN : SURAT KEPALA DINAS KOMUNIKASI DAN INFORMATIKA PROVINSI JAWA BARAT
                  </p>
                  <table className="text-xs text-slate-900 border-collapse">
                    <tbody>
                      <tr className="align-top">
                        <td className="pr-4 py-0.5 font-normal">Nomor</td>
                        <td className="pr-2 py-0.5 text-center">:</td>
                        <td className="py-0.5 font-normal">{previewItem.nomor_surat || "…/KOM.03.01.08/APTIKA"}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-4 py-0.5 font-normal">Tanggal</td>
                        <td className="pr-2 py-0.5 text-center">:</td>
                        <td className="py-0.5 font-normal">{formatDate(previewItem.tanggal)}</td>
                      </tr>
                      <tr className="align-top">
                        <td className="pr-4 py-0.5 font-normal">Hal</td>
                        <td className="pr-2 py-0.5 text-center">:</td>
                        <td className="py-0.5 font-normal leading-snug">{previewItem.perihal || "Pemberitahuan kerentanan aplikasi"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section A: RINCIAN TEMUAN KERENTANAN */}
              <div className="mb-6">
                <h3 className="font-bold text-xs text-slate-900 mb-3 uppercase">
                  A. RINCIAN TEMUAN KERENTANAN
                </h3>
                
                {previewItem.deskripsi ? (
                  <div className="mb-4">
                    <FormattedContentViewer content={previewItem.deskripsi} />
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-slate-900 leading-relaxed text-justify">
                    <p>
                      <span className="font-semibold">{previewItem.tingkat_kerentanan || "Sensitive Data Exposure"}</span> merupakan kondisi ketika data sensitif, khususnya data pribadi pengguna atau individu dapat diakses tanpa pembatasan yang memadai, sehingga data tersebut berpotensi dapat diakses oleh pihak yang tidak berwenang. Data sensitif yang dimaksud dapat mencakup dokumen yang berisi informasi seperti Nomor Induk Kependudukan (NIK), Nomor Induk Pegawai (NIP), Alamat, maupun informasi sensitif lainnya yang dapat dikategorikan sebagai Personally Identifiable Information (PII).
                    </p>
                    <p>
                      Pada temuan kerentanan ini, aplikasi/website <span className="font-semibold">{previewItem.url || previewItem.aplikasi}</span> menampilkan tautan menuju dokumen atau platform penyimpanan publik yang memuat informasi rincian teknis, nilai kontrak, hingga data pribadi seperti NIP dan NIK.
                    </p>
                  </div>
                )}

                {/* Table DAFTAR TEMUAN KERENTANAN */}
                <div className="my-6">
                  <h4 className="font-bold text-xs text-slate-900 text-center uppercase mb-3 tracking-wider">
                    DAFTAR TEMUAN KERENTANAN
                  </h4>
                  <table className="w-full text-xs text-left border-collapse border border-slate-900">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900">
                        <th className="px-2 py-1.5 text-center border-r border-slate-900 w-10">No</th>
                        <th className="px-3 py-1.5 border-r border-slate-900">Nama Aplikasi/Website</th>
                        <th className="px-3 py-1.5 border-r border-slate-900">URL</th>
                        <th className="px-3 py-1.5 border-r border-slate-900">Kerentanan</th>
                        <th className="px-3 py-1.5">Pemilik Aplikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      <tr>
                        <td className="px-2 py-2 text-center border-r border-slate-900">1.</td>
                        <td className="px-3 py-2 border-r border-slate-900 font-medium">{previewItem.aplikasi || "Rumah Sakit Jiwa (RSJ)"}</td>
                        <td className="px-3 py-2 border-r border-slate-900 text-blue-700 underline break-all">{previewItem.url || "rsj.jabarprov.go.id"}</td>
                        <td className="px-3 py-2 border-r border-slate-900 font-semibold">{previewItem.tingkat_kerentanan || "Sensitive Data Exposure"}</td>
                        <td className="px-3 py-2 font-medium">{previewItem.pemilik_aplikasi || previewItem.tujuan || "Dinas Kesehatan"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Evidence content / photos directly below table */}
                {previewItem.isi_lampiran && (
                  <div className="mt-4 mb-6">
                    <FormattedContentViewer content={previewItem.isi_lampiran} />
                  </div>
                )}

                {/* Attached file download link if file uploaded */}
                {previewItem.lampiran_nama && (
                  <div className="mt-4 mb-6 border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-xs truncate">{previewItem.lampiran_nama}</p>
                        <p className="text-[10px] text-slate-500">Berkas pendukung terlampir</p>
                      </div>
                      {previewItem.lampiran_url && (
                        <a
                          href={previewItem.lampiran_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="print:hidden flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                        >
                          <Download size={12} /> Unduh
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Section B: REKOMENDASI */}
              <div className="mb-6 text-xs text-slate-900 leading-relaxed font-sans">
                <h3 className="font-bold text-xs text-slate-900 mb-3 uppercase">
                  B. REKOMENDASI:
                </h3>
                <p className="mb-3">Beberapa rekomendasi teknis yang dapat dilakukan, antara lain:</p>
                <div className="space-y-3 pl-4">
                  <div>
                    <p className="font-semibold mb-1">1) {previewItem.tingkat_kerentanan || "Sensitive Data Exposure"}</p>
                    <ol className="list-[lower-alpha] pl-5 space-y-1.5 text-justify">
                      <li>
                        Melakukan pembatasan akses folder pada direktori penyimpanan menjadi <span className="italic font-semibold">restricted</span> dan hanya dibagikan kepada akun Perangkat Daerah/Perusahaan atau pihak yang berwenang serta telah terverifikasi, dan tidak membuka akses publik secara penuh;
                      </li>
                      <li>
                        Melakukan klasifikasi dan inventarisasi terhadap dokumen yang mengandung informasi data sensitif agar tidak dapat diakses secara bebas oleh publik sesuai dengan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
                      </li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">2) Serta menerapkan beberapa hal berikut ini:</p>
                    <ol className="list-[lower-alpha] pl-5 space-y-1.5 text-justify">
                      <li>
                        Jika aplikasi yang dibangun khusus untuk keperluan internal Perangkat Daerah Provinsi Jawa Barat sebaiknya hanya dapat diakses melalui Jaringan Intra Pemerintah Daerah Provinsi Jawa Barat (JIP);
                      </li>
                      <li>
                        Menerapkan kebijakan syarat penggunaan kata sandi dengan menggunakan minimal 12 karakter yang mengandung:
                        <ul className="list-[lower-roman] pl-6 pt-1 space-y-0.5">
                          <li>1 (satu) huruf kapital;</li>
                          <li>1 (satu) huruf nonkapital;</li>
                          <li>1 (satu) angka;</li>
                          <li>1 (satu) karakter spesial.</li>
                        </ul>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature & TTE Box on Attachment */}
            <div className="flex justify-end mt-8">
              <div className="text-center w-80 text-xs text-slate-900 font-sans">
                <p className="font-bold uppercase leading-tight">
                  KEPALA DINAS KOMUNIKASI DAN INFORMATIKA
                </p>
                <p className="font-bold uppercase leading-tight mb-3">
                  PROVINSI JAWA BARAT,
                </p>

                {/* TTE Box */}
                <div className="my-3 border border-slate-400 rounded-lg p-2.5 bg-slate-50/40 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-blue-100/50 rounded">
                    <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 5 L85 25 L85 65 C85 80, 65 92, 50 95 C35 92, 15 80, 15 65 L15 25 Z" fill="#1565c0" />
                      <circle cx="50" cy="50" r="14" fill="#ffeb3b" />
                    </svg>
                  </div>
                  <div className="text-[9px] leading-tight text-slate-800">
                    <p className="text-[8px] text-slate-500">Ditandatangani secara elektronik oleh:</p>
                    <p className="font-bold uppercase text-[9px] mt-0.5">KEPALA DINAS KOMUNIKASI DAN INFORMATIKA</p>
                    <p className="font-bold uppercase text-[9px]">PROVINSI JAWA BARAT</p>
                    <p className="font-bold mt-1 text-[9.5px]">MAS ADI KOMAR, S.STP., M.Tr.A.P</p>
                    <p className="text-slate-600 text-[8.5px]">Pembina TK.I</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Form View Render
  if (viewState === "form") {
    return (
      <div suppressHydrationWarning className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {formMode === "create" ? "Buat Peringatan Kerentanan" : "Edit Peringatan Kerentanan"}
            </h2>
            <p className="text-xs text-slate-500">
              Silakan isi formulir di bawah ini untuk menerbitkan pemberitahuan celah keamanan.
            </p>
          </div>
          <button
            onClick={() => setViewState("list")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
          >
            <ArrowLeft size={15} /> Kembali
          </button>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Aplikasi Terdampak *</label>
              <input
                type="text"
                required
                value={aplikasi}
                onChange={(e) => setAplikasi(e.target.value)}
                placeholder="Contoh: Portal Layanan OPD X"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL / Domain</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://opd.jabarprov.go.id"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Kerentanan *</label>
              <select
                value={tingkatKerentanan}
                onChange={(e) => setTingkatKerentanan(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Perihal *</label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="Pemberitahuan Celah Keamanan Kritis"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          <RichTextEditor
            label="Deskripsi Kerentanan & Langkah Mitigasi"
            rows={6}
            value={deskripsi}
            onChange={setDeskripsi}
            placeholder="Jelaskan detail kerentanan (misal SQL Injection / XSS) dan panduan perbaikan..."
          />

          <RichTextEditor
            label="Isi Lampiran / Bukti Kerentanan"
            rows={6}
            value={isiLampiran}
            onChange={setIsiLampiran}
            placeholder="Tuliskan rincian bukti lampiran, tangkapan layar, atau link berkas pendukung (misal: Google Drive)..."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            >
              <option value="DRAF">DRAF</option>
              <option value="TERKIRIM">TERKIRIM</option>
              <option value="TERSOLUSIKAN">TERSOLUSIKAN</option>
            </select>
          </div>

          {/* Lampiran / Attachment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <Paperclip size={13} className="inline mr-1 -mt-0.5" />
              Lampiran (Bukti / Dokumen Pendukung)
            </label>
            
            {/* Existing lampiran display */}
            {existingLampiran && !hapusLampiran && !lampiranFile && (
              <div className="flex items-center gap-2 mb-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                <FileText size={16} className="text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-800 truncate">{existingLampiran.nama}</p>
                  <p className="text-[10px] text-blue-500">File terlampir saat ini</p>
                </div>
                {existingLampiran.url && (
                  <a
                    href={existingLampiran.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-100 rounded-lg"
                  >
                    Lihat
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setHapusLampiran(true)}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus lampiran"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Removed lampiran notice */}
            {hapusLampiran && !lampiranFile && (
              <div className="flex items-center gap-2 mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700 flex-1">Lampiran akan dihapus saat disimpan.</p>
                <button
                  type="button"
                  onClick={() => setHapusLampiran(false)}
                  className="text-[10px] font-semibold text-amber-600 hover:text-amber-800 px-2 py-1 bg-amber-100 rounded-lg"
                >
                  Batal
                </button>
              </div>
            )}

            {/* New file selected */}
            {lampiranFile && (
              <div className="flex items-center gap-2 mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <FileText size={16} className="text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-800 truncate">{lampiranFile.name}</p>
                  <p className="text-[10px] text-emerald-500">{(lampiranFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLampiranFile(null);
                    setHapusLampiran(false);
                  }}
                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus file baru"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* File input */}
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    setLampiranFile(file);
                    setHapusLampiran(false);
                  }
                  e.target.value = "";
                }}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:border-red-500 transition-colors cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Format: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, ZIP, RAR. Maksimal 10MB.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setViewState("list")}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm"
            >
              Simpan Peringatan
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List View Render
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => window.location.href = "/administrasisurat"} className="text-slate-400 hover:text-slate-600">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
              <TriangleAlert size={22} className="text-red-500" />
              Pemberitahuan Kerentanan
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola surat peringatan dini mengenai celah keamanan dan advis keselamatan sistem informasi.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => handleOpenForm("create")}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus size={14} /> Buat Peringatan
          </button>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari aplikasi, nomor, kerentanan..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
              <tr>
                <th className="p-3">No. Surat</th>
                <th className="p-3">Aplikasi</th>
                <th className="p-3">Tingkat Risiko</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400">Loading data...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-400">Belum ada data kerentanan.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">{item.nomor_surat}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{item.aplikasi}</p>
                      <p className="text-[11px] text-slate-400">{item.url || "-"}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getSeverityBadge(item.tingkat_kerentanan)}`}>
                        {item.tingkat_kerentanan || "Sedang"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{formatDate(item.tanggal)}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {item.status || "DRAF"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewItem(item);
                            setViewState("preview");
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title="Lihat Detail"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenForm("edit", item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Kerentanan"
        message="Apakah Anda yakin ingin menghapus peringatan kerentanan ini? Data yang dihapus tidak dapat dikembalikan."
        loading={isDeleting}
      />
    </div>
  );
}

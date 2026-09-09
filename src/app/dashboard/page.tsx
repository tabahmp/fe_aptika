"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  Briefcase,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Eye,
  ChevronDown,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";

interface ServicePermissionItem {
  service_id: number;
  code: string;
  name: string;
  is_enabled: boolean;
}

interface BidangMatrixItem {
  bidang_id: number;
  bidang_code: string;
  bidang_name: string;
  services: ServicePermissionItem[];
}

export default function Homepage() {
  const router = useRouter();
  const [mounted, setMounted]   = useState(false);
  const [userName, setUserName] = useState("User");

  const { user, bidang, isAdminAptika, hasServicePermission, fetchProfile } = useAuthStore();

  const isSuperAdmin =
    isAdminAptika ||
    (user?.role === "admin" && (bidang?.code === "APTIKA" || (user as any)?.bidang_id === 3));

  // State khusus Super Admin untuk penyaringan per-bidang
  const [selectedBidangId, setSelectedBidangId] = useState<string>("all");
  const [bidangMatrixList, setBidangMatrixList] = useState<BidangMatrixItem[]>([]);
  const [matrixLoading, setMatrixLoading]       = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj?.name) setUserName(uObj.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [fetchProfile]);

  // Muat Matriks Layanan jika user adalah Super Admin
  const fetchMatrix = useCallback(async () => {
    if (!isSuperAdmin) return;
    setMatrixLoading(true);
    try {
      const res = await api.get("/admin/bidang-services");
      if (res.data?.success) {
        setBidangMatrixList(res.data.data);
      }
    } catch (e) {
      console.error("Gagal memuat matriks layanan per bidang:", e);
    } finally {
      setMatrixLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchMatrix();
    }
  }, [isSuperAdmin, fetchMatrix]);

  const allCards = [
    {
      id: "administrasi-surat",
      code: "ADMINISTRASI_SURAT",
      title: "Administrasi Surat",
      desc: "Layanan administrasi Nota Dinas, Hasil Pentest, Kerentanan, SPD, dan Permohonan TI.",
      icon: <FileText size={22} className="text-amber-700" />,
      iconBg: "bg-amber-100 dark:bg-amber-950/60",
      actionText: "Kelola Surat",
      actionColor: "text-amber-700 dark:text-amber-400",
      path: "/administrasisurat",
    },
    {
      id: "magang",
      code: "MAGANG",
      title: "Magang",
      desc: "Pengelolaan data peserta magang, presensi, penugasan, dan administrasi magang.",
      icon: <Users size={22} className="text-orange-600" />,
      iconBg: "bg-orange-100 dark:bg-orange-950/60",
      actionText: "Kelola Magang",
      actionColor: "text-orange-600 dark:text-orange-400",
      path: "/magang/dashboard",
    },
    {
      id: "manajemen-tugas-digital",
      code: "MANAJEMEN_TUGAS",
      title: "Manajemen Tugas Digital",
      desc: "Monitoring penugasan, alur kerja digital, dan manajemen penyelesaian tugas tim.",
      icon: <Briefcase size={22} className="text-teal-600" />,
      iconBg: "bg-teal-100 dark:bg-teal-950/60",
      actionText: "Kelola Tugas",
      actionColor: "text-teal-600 dark:text-teal-400",
      path: "/manajementugasdigital",
    },
    {
      id: "iki-report",
      code: "IKI_REPORT",
      title: "IKI Report",
      desc: "Layanan rekapitulasi data Indikator Kinerja Individu (Integrasi, Pengelolaan, Rekayasa, Sidebar, Smart Jabar, Sada Jabar).",
      icon: <Layers size={22} className="text-purple-600" />,
      iconBg: "bg-purple-100 dark:bg-purple-950/60",
      actionText: "Buka IKI Report",
      actionColor: "text-purple-600 dark:text-purple-400",
      path: "/integrasiinteroperabilitas/dashboard",
    },
    {
      id: "smki",
      code: "SMKI",
      title: "SMKI",
      desc: "Layanan administrasi dan tata kelola Surat Manajemen Keamanan Informasi (SMKI).",
      icon: <ShieldCheck size={22} className="text-emerald-600" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/60",
      actionText: "Buka SMKI",
      actionColor: "text-emerald-600 dark:text-emerald-400",
      path: "/smki",
    },
  ];

  // Penentuan modul yang tampil
  // 1. Jika Super Admin & memilih 'all' → Tampilkan SELURUH Modul Tanpa Batasan
  // 2. Jika Super Admin & memilih ID bidang tertentu → Saring berdasarkan status is_enabled pada bidang tersebut
  // 3. Jika User biasa / Admin Bidang biasa → Saring berdasarkan hak akses pengguna
  const getFilteredCards = () => {
    if (!mounted) return allCards;

    if (isSuperAdmin) {
      if (selectedBidangId === "all") {
        return allCards;
      }
      const targetBidang = bidangMatrixList.find(
        (b) => String(b.bidang_id) === selectedBidangId
      );
      if (!targetBidang) return allCards;

      // Hanya tampilkan card yang aktif pada bidang yang dipilih
      return allCards.filter((card) => {
        const svc = targetBidang.services.find((s) => s.code === card.code);
        return svc ? svc.is_enabled : true;
      });
    }

    // Pengguna biasa / Admin Bidang biasa
    return allCards.filter((c) => hasServicePermission(c.code));
  };

  const cards = getFilteredCards();

  const selectedBidangObj = bidangMatrixList.find(
    (b) => String(b.bidang_id) === selectedBidangId
  );

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0b2146] via-[#163868] to-[#1d4ed8] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-cyan-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-200 text-xs font-semibold backdrop-blur-sm border border-white/15 mb-3">
              <Sparkles size={14} className="text-cyan-300 animate-pulse" />
              <span>APTIKA Tools Jawa Barat</span>
              {isSuperAdmin && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold text-[10px] uppercase tracking-wider">
                  Super Admin
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Selamat Datang, <span className="text-cyan-300" suppressHydrationWarning>{userName}</span>
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              {isSuperAdmin
                ? "Sebagai Super Admin, Anda memiliki wewenang penuh untuk meninjau dan mengakses seluruh layanan lintas 7 Unit Kerja Diskominfo Jawa Barat."
                : "Platform pengelolaan dan rekapitulasi data Aplikasi Informatika Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Silakan pilih layanan di bawah untuk memulai."}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Status Sistem: <strong className="text-emerald-300">Aktif</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <Layers size={16} className="text-cyan-300" />
              <span suppressHydrationWarning>Total Modul: <strong className="text-white">{cards.length} Layanan</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BAR KHUSUS SUPER ADMIN: SELECTOR BIDANG / UNIT KERJA ── */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Building2 size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-amber-300">
                    Mode Pengawasan Super Admin: Tinjau Layanan Per Bidang
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-amber-950 uppercase tracking-wider">
                    Khusus Super Admin
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Pilih unit kerja untuk melihat ketersediaan & konfigurasi layanan aktif pada bidang tersebut.
                </p>
              </div>
            </div>

            {/* Dropdown Selector Bidang */}
            <div className="relative flex-shrink-0 min-w-[240px]">
              <select
                value={selectedBidangId}
                onChange={(e) => setSelectedBidangId(e.target.value)}
                disabled={matrixLoading}
                className="w-full pl-9 pr-8 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-[#0b1630] border-2 border-amber-500/40 text-slate-800 dark:text-amber-200 focus:outline-none focus:border-amber-500 shadow-sm appearance-none cursor-pointer"
              >
                <option value="all">🌐 Semua Bidang (Akses Super Admin)</option>
                {bidangMatrixList.map((b) => (
                  <option key={b.bidang_id} value={String(b.bidang_id)}>
                    🏛️ [{b.bidang_code}] {b.bidang_name}
                  </option>
                ))}
              </select>
              <Eye size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none" />
            </div>
          </div>

          {/* Quick Info Bar Pilihan Bidang */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-semibold gap-2">
            <span>
              Menampilkan Layanan untuk:{" "}
              <strong className="text-amber-700 dark:text-amber-300">
                {selectedBidangId === "all"
                  ? "Seluruh Unit Kerja (Hak Akses Penuh Super Admin)"
                  : selectedBidangObj
                  ? `Bidang ${selectedBidangObj.bidang_name} (${selectedBidangObj.bidang_code})`
                  : "Unit Kerja Terpilih"}
              </strong>
            </span>
            {selectedBidangId !== "all" && (
              <button
                onClick={() => setSelectedBidangId("all")}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
              >
                Reset ke Semua Bidang ↺
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title Section (Frosted Glass Style) */}
      <div className="bg-white/50 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/70 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[22px] font-bold text-blue-700 dark:text-blue-400 mb-1">
            Pilih Modul Service
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {isSuperAdmin && selectedBidangId !== "all"
              ? `Status ketersediaan modul untuk Bidang ${selectedBidangObj?.bidang_name || ""}:`
              : "Silakan pilih modul layanan yang ingin Anda kelola untuk mengakses dashboard dan fitur terkait."}
          </p>
        </div>
      </div>

      {/* Grid of Service Button Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.path)}
            className="bg-white/45 dark:bg-[#071733]/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/70 dark:border-slate-800 flex flex-col cursor-pointer transition-all duration-200 group h-full relative overflow-hidden hover:bg-white/75 dark:hover:bg-[#0b2146] hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/60"
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white/80 dark:border-slate-700/80 ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {card.title}
            </h3>

            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed flex-grow font-semibold">
              {card.desc}
            </p>

            <div className={`flex items-center gap-1.5 mt-6 font-bold text-[13px] ${card.actionColor}`}>
              <span>{card.actionText}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

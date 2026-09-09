"use client";

import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileCheck2,
  Lock,
  ArrowLeft,
  Sparkles,
  Building2,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
  Laptop,
  ArrowRight,
  DownloadCloud,
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";

export default function SmkiPage() {
  const router = useRouter();
  const { user, bidang, isAdminAptika } = useAuthStore();

  const previewRoadmap = [
    {
      title: "Pengajuan & Registrasi Dokumen SMKI",
      desc: "Penyusunan permohonan, pencatatan nomor registrasi, serta pengunggahan instrumen kepatuhan Sistem Manajemen Keamanan Informasi.",
      icon: FileCheck2,
      badge: "Tahap Pengembangan",
    },
    {
      title: "Audit & Penilaian Kontrol Kepatuhan",
      desc: "Evaluasi kontrol keamanan informasi berbasis standar ISO/IEC 27001, CSIRT, dan Peraturan SPBE Nasional.",
      icon: Lock,
      badge: "Tahap Pengembangan",
    },
    {
      title: "Arsip & Pengesahan Digital Surat SMKI",
      desc: "Distribusi surat hasil evaluasi kepatuhan, verifikasi tanda tangan digital, dan pelaporan metrik keamanan terpadu.",
      icon: FileText,
      badge: "Tahap Pengembangan",
    },
  ];

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm transition-all"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Modul SMKI Terhubung & Aktif</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-white/20 mb-3">
                <ShieldCheck size={14} className="text-emerald-200" />
                <span>Sistem Manajemen Keamanan Informasi (SMKI)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                SMKI Diskominfo Jawa Barat
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Pusat tata kelola, inventarisasi software resmi, kepatuhan lisensi, dan penerbitan dokumen standardisasi keamanan informasi di lingkungan Pemerintah Provinsi Jawa Barat.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Bidang: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Clock size={16} className="text-emerald-200" />
                <span>Status Layanan: <strong className="text-emerald-100">Aktif & Beroperasi</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Sub-Layanan Tersedia (Active Sub-Services) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
                Sub-Layanan SMKI Aktif
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih sub-layanan yang ingin dikelola atau dilakukan pengisian formulir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Manajemen Daftar Software Standar (FR-017) */}
            <div
              onClick={() => router.push("/smki/software-standar")}
              className="group relative bg-white dark:bg-slate-900/90 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                  <Laptop size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Manajemen Software Standar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-4">
                  Kelola inventaris perangkat lunak resmi, audit lisensi, serta otomatis ekspor formulir input ke dalam template dokumen resmi
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-start text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Buka Layanan</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Roadmap / Fitur Tambahan */}
        <div className="flex flex-col gap-3 pt-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              Rencana Pengembangan Sub-Modul SMKI Lainnya
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modul kepatuhan dan audit lanjutan yang dirancang untuk melengkapi tata kelola keamanan.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {previewRoadmap.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-3">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <span>{item.badge}</span>
                    <Clock size={13} className="text-amber-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}

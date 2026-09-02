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
} from "lucide-react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";

export default function SmkiPage() {
  const router = useRouter();
  const { user, bidang, isAdminAptika } = useAuthStore();

  const previewModules = [
    {
      title: "Pengajuan & Registrasi Dokumen SMKI",
      desc: "Penyusunan permohonan, pencatatan nomor registrasi, serta pengunggahan instrumen kepatuhan Sistem Manajemen Keamanan Informasi.",
      icon: FileCheck2,
      badge: "Tahap Persiapan",
    },
    {
      title: "Audit & Penilaian Kontrol Kepatuhan",
      desc: "Evaluasi kontrol keamanan informasi berbasis standar ISO/IEC 27001, CSIRT, dan Peraturan SPBE Nasional.",
      icon: Lock,
      badge: "Tahap Persiapan",
    },
    {
      title: "Arsip & Pengesahan Digital Surat SMKI",
      desc: "Distribusi surat hasil evaluasi kepatuhan, verifikasi tanda tangan digital, dan pelaporan metrik keamanan terpadu.",
      icon: FileText,
      badge: "Tahap Persiapan",
    },
  ];

  return (
    <ServiceRouteGuard requiredService="SMKI">
      <div className="flex flex-col gap-6 pb-8">
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
            <span>Layanan Terdaftar & Aktif</span>
          </div>
        </div>

        {/* Hero Banner Modul */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
          <div className="absolute right-36 -top-12 w-48 h-48 rounded-full bg-teal-300/15 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur-sm border border-white/20 mb-3">
                <ShieldCheck size={14} className="text-emerald-200" />
                <span>Modul Layanan Multi-Bidang</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                SMKI (Surat Manajemen Keamanan Informasi)
              </h1>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Pusat tata kelola, pengarsipan, dan penerbitan Surat Manajemen Keamanan Informasi untuk seluruh unit kerja dan bidang di lingkungan Diskominfo Provinsi Jawa Barat.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Building2 size={16} className="text-emerald-300" />
                <span>Bidang: <strong className="text-white">{bidang?.name || "Semua Bidang"}</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
                <Clock size={16} className="text-amber-300" />
                <span>Status Modul: <strong className="text-amber-200">Kosongan / Persiapan</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State / Coming Soon Card Container */}
        <div className="bg-white/60 dark:bg-[#071733]/80 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-white/80 dark:border-slate-800 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-inner">
            <ShieldCheck size={40} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-bold mb-3">
            <Sparkles size={13} />
            <span>Modul Layanan Terhubung</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Modul SMKI Siap Dikembangkan
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mb-8 leading-relaxed font-medium">
            Rute dan hak akses layanan <strong>SMKI</strong> telah terintegrasi dengan sistem otentikasi serta Service Matrix per-bidang. Fitur dan formulir manajemen surat keamanan informasi akan segera diimplementasikan pada iterasi berikutnya.
          </p>

          {/* Feature Roadmap Preview Cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 text-left mb-6">
            {previewModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
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
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Layers size={15} />
              <span>Kembali ke Beranda Utama</span>
            </button>
            {isAdminAptika && (
              <button
                onClick={() => router.push("/admin/service-matrix")}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 transition-all"
              >
                Pengaturan Matriks Layanan
              </button>
            )}
          </div>
        </div>
      </div>
    </ServiceRouteGuard>
  );
}

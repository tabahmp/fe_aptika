"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  Briefcase,
  Users,
  UserCog,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import { useAuthStore } from "@/store/useAuthStore";

export default function Homepage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");

  const { hasServicePermission, isAdminAptika } = useAuthStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          if (uObj?.name) setUserName(uObj.name);
          if (uObj?.role) setUserRole(uObj.role);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const allCards = [
    {
      id: "iki-report",
      code: "IKI_REPORT",
      title: "IKI Report",
      desc: "Layanan rekapitulasi data IKI Aptika (Integrasi Interoperabilitas, Pengelolaan Aplikasi, Rekayasa Aplikasi, Sidebar Jabar, Smart Jabar, Sada Jabar).",
      icon: <Layers size={22} className="text-purple-600" />,
      iconBg: "bg-purple-100",
      actionText: "Buka IKI Report",
      actionColor: "text-purple-600",
      path: "/integrasiinteroperabilitas/dashboard",
    },
    {
      id: "administrasi-surat",
      code: "ADMINISTRASI_SURAT",
      title: "Administrasi Surat",
      desc: "Layanan administrasi Nota Dinas, Hasil Pentest, Kerentanan, SPD, dan Permohonan TI.",
      icon: <FileText size={22} className="text-amber-700" />,
      iconBg: "bg-amber-100",
      actionText: "Kelola Surat",
      actionColor: "text-amber-700",
      path: "/administrasisurat",
    },
    {
      id: "manajemen-tugas-digital",
      code: "MANAJEMEN_TUGAS",
      title: "Manajemen Tugas Digital",
      desc: "Monitoring penugasan, alur kerja digital, dan manajemen penyelesaian tugas tim.",
      icon: <Briefcase size={22} className="text-teal-600" />,
      iconBg: "bg-teal-100",
      actionText: "Kelola Tugas",
      actionColor: "text-teal-600",
      path: "/manajementugasdigital",
    },
    {
      id: "magang",
      code: "MAGANG",
      title: "Magang",
      desc: "Pengelolaan data peserta magang, presensi, penugasan, dan administrasi magang Aptika.",
      icon: <Users size={22} className="text-orange-600" />,
      iconBg: "bg-orange-100",
      actionText: "Kelola Magang",
      actionColor: "text-orange-600",
      path: "/magang/dashboard",
    },
    ...(isAdminAptika
      ? [
        {
          id: "manajemen-user",
          code: "ADMIN_PANEL",
          title: "Manajemen User",
          desc: "Pengelolaan akun pengguna, hak akses, peranan (role), dan status keaktifan user dalam sistem APTIKA.",
          icon: <UserCog size={22} className="text-violet-600" />,
          iconBg: "bg-violet-100",
          actionText: "Kelola User",
          actionColor: "text-violet-600",
          badge: "Admin Only",
          path: "/admin/users",
        },
      ]
      : []),
  ];

  const cards = allCards.filter(
    (c) => c.code === "ADMIN_PANEL" || hasServicePermission(c.code)
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
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Selamat Datang, <span className="text-cyan-300">{userName}</span>
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              Platform pengelolaan dan rekapitulasi data Aplikasi Informatika Dinas Komunikasi dan Informatika Provinsi Jawa Barat. Silakan pilih layanan di bawah untuk memulai.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Status Sistem: <strong className="text-emerald-300">Aktif</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-xs font-semibold">
              <Layers size={16} className="text-cyan-300" />
              <span>Total Modul: <strong className="text-white">{cards.length} Layanan</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Title Section (Frosted Glass Style) */}
      <div className="bg-white/50 dark:bg-[#071733]/90 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/70 dark:border-slate-800">
        <h2 className="text-[22px] font-bold text-blue-700 dark:text-blue-400 mb-2">
          Pilih Modul Service
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Silakan pilih modul layanan yang ingin Anda kelola untuk mengakses dashboard dan fitur terkait.
        </p>
      </div>

      {/* Grid of Service Button Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.path)}
            className="bg-white/45 dark:bg-[#071733]/80 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/70 dark:border-slate-800 flex flex-col cursor-pointer hover:bg-white/75 dark:hover:bg-[#0b2146] hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-500/60 transition-all duration-200 group h-full relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-white/80 dark:border-slate-700/80 ${card.iconBg}`}
              >
                {card.icon}
              </div>
              {card.badge && (
                <span className="px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 font-extrabold text-[10px] tracking-wider uppercase border border-violet-200 dark:border-violet-800 shadow-sm">
                  {card.badge}
                </span>
              )}
            </div>

            <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-3 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {card.title}
            </h3>

            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed flex-grow font-semibold">
              {card.desc}
            </p>

            <div
              className={`flex items-center gap-1.5 mt-6 font-bold text-[13px] ${card.actionColor}`}
            >
              <span>{card.actionText}</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

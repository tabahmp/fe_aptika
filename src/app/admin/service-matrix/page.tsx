"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import {
  ShieldCog,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface ServiceItem {
  service_id: number;
  parent_id?: number | null;
  code: string;
  name: string;
  is_enabled: boolean;
}

interface BidangMatrix {
  bidang_id: number;
  bidang_code: string;
  bidang_name: string;
  services: ServiceItem[];
}

type TabType = "MAIN" | "SURAT" | "IKI";

const TAB_COLUMNS: Record<TabType, { code: string; label: string }[]> = {
  MAIN: [
    { code: "ADMINISTRASI_SURAT", label: "Administrasi Surat" },
    { code: "IKI_REPORT",         label: "IKI Report" },
    { code: "MANAJEMEN_TUGAS",    label: "Manajemen Tugas Digital" },
    { code: "MAGANG",             label: "Magang" },
    { code: "SMKI",               label: "SMKI" },
  ],
  SURAT: [
    { code: "SURAT_NOTA_DINAS",     label: "Nota Dinas" },
    { code: "SURAT_SPD",            label: "Surat Perjalanan Dinas" },
    { code: "SURAT_HASIL_PENTEST",  label: "Laporan Hasil Pentest" },
    { code: "SURAT_KERENTANAN",     label: "Laporan Kerentanan" },
    { code: "SURAT_PERMOHONAN_TI",  label: "Form Perubahan IT (RFC)" },
  ],
  IKI: [
    { code: "IKI_INTEGRASI",  label: "Integrasi Interoperabilitas" },
    { code: "IKI_PENGELOLAAN",label: "Pengelolaan Aplikasi" },
    { code: "IKI_REKAYASA",   label: "Rekayasa Aplikasi" },
    { code: "IKI_SIDEBAR",    label: "Sidebar Jabar" },
    { code: "IKI_SMARTJABAR", label: "Smart Jabar" },
    { code: "IKI_SADAJABAR",  label: "Sada Jabar" },
  ],
};

export default function AdminServiceMatrixPage() {
  const { user, bidang, isAdminAptika, fetchProfile } = useAuthStore();
  const isSuperAdmin =
    isAdminAptika ||
    (user?.role === "admin" && (bidang?.code === "APTIKA" || (user as any)?.bidang_id === 3));

  const [matrix, setMatrix]           = useState<BidangMatrix[]>([]);
  const [loading, setLoading]         = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<TabType>("MAIN");

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bidang-services");
      if (res.data?.success) setMatrix(res.data.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal memuat konfigurasi layanan bidang.";
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMatrix();
  }, [fetchProfile, fetchMatrix]);

  const handleToggle = async (
    bidangId: number,
    serviceId: number,
    currentStatus: boolean,
    bidangCode: string,
    serviceName: string
  ) => {
    const key       = `${bidangId}-${serviceId}`;
    const newStatus = !currentStatus;
    setUpdatingKey(key);

    try {
      const res = await api.put("/admin/bidang-services", {
        bidang_id:  bidangId,
        service_id: serviceId,
        is_enabled: newStatus,
      });

      if (res.data?.success) {
        showToast.success(
          `Layanan "${serviceName}" untuk ${bidangCode}: ${newStatus ? "Aktif ✓" : "Nonaktif ✗"}`
        );
        setMatrix((prev) =>
          prev.map((b) =>
            b.bidang_id === bidangId
              ? {
                  ...b,
                  services: b.services.map((s) =>
                    s.service_id === serviceId ? { ...s, is_enabled: newStatus } : s
                  ),
                }
              : b
          )
        );
        // Sync profile state
        fetchProfile();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal memperbarui status layanan.";
      showToast.error(msg);
    } finally {
      setUpdatingKey(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCog size={40} className="text-slate-400 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-400">Akses Ditolak</p>
          <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">
            Konfigurasi Matriks Layanan hanya tersedia untuk Super Admin.
          </p>
        </div>
      </div>
    );
  }

  const columns = TAB_COLUMNS[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25 flex items-center justify-center">
            <ShieldCog size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800 dark:text-white">
              Konfigurasi Matriks Layanan Bidang
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle hak akses modul & sub-layanan untuk seluruh 7 Unit Kerja Diskominfo Jabar.
            </p>
          </div>
        </div>
        <button
          onClick={fetchMatrix}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 w-fit shadow-sm"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Muat Ulang
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2">
        {(
          [
            { key: "MAIN",  label: "Modul Utama (4 Service)",        icon: LayoutGrid, color: "bg-blue-600 shadow-blue-500/20" },
            { key: "SURAT", label: "Jenis Surat (Administrasi)",     icon: FileText,   color: "bg-amber-600 shadow-amber-500/20" },
            { key: "IKI",   label: "Sub-Modul IKI Report",           icon: Layers,     color: "bg-purple-600 shadow-purple-500/20" },
          ] as const
        ).map((tab) => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? `${tab.color} text-white shadow-md`
                  : "bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-[#0b1630] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm transition-colors duration-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Memuat matriks layanan...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/60 text-slate-500 bg-slate-50/80 dark:bg-slate-900/30">
                  <th className="py-4 px-6 font-semibold uppercase tracking-wider min-w-[200px]">
                    Bidang / Unit Kerja
                  </th>
                  {columns.map((col) => (
                    <th key={col.code} className="py-4 px-4 text-center font-semibold uppercase tracking-wider min-w-[150px]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {matrix.map((b) => (
                  <tr key={b.bidang_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/25">
                          {b.bidang_code}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-300">{b.bidang_name}</span>
                      </div>
                    </td>

                    {columns.map((col) => {
                      const svc        = b.services.find((s) => s.code === col.code);
                      const isEnabled  = svc?.is_enabled ?? false;
                      const key        = `${b.bidang_id}-${svc?.service_id}`;
                      const isUpdating = updatingKey === key;

                      return (
                        <td key={col.code} className="py-4 px-4 text-center">
                          {svc ? (
                            <button
                              onClick={() =>
                                handleToggle(b.bidang_id, svc.service_id, isEnabled, b.bidang_code, col.label)
                              }
                              disabled={isUpdating}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shadow-sm ${
                                isEnabled
                                  ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25 hover:bg-emerald-100 dark:hover:bg-emerald-500/25"
                                  : "bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700/50"
                              }`}
                            >
                              {isUpdating ? (
                                <RefreshCw size={11} className="animate-spin" />
                              ) : isEnabled ? (
                                <CheckCircle2 size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {isEnabled ? "Aktif" : "Nonaktif"}
                            </button>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-700">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { showToast } from "@/components/ui/Toast";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import { ShieldCog, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface ServiceItem {
  service_id: number;
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

export default function AdminBidangServicesPage() {
  const [matrix, setMatrix] = useState<BidangMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const fetchMatrix = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bidang-services");
      if (res.data && res.data.success) {
        setMatrix(res.data.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat matriks bidang services:", err);
      showToast.error("Gagal memuat konfigurasi layanan bidang.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrix();
  }, []);

  const handleToggle = async (bidangId: number, serviceId: number, currentStatus: boolean, bidangCode: string, serviceCode: string) => {
    const key = `${bidangId}-${serviceId}`;
    setUpdatingKey(key);
    const newStatus = !currentStatus;

    try {
      const res = await api.put("/admin/bidang-services", {
        bidang_id: bidangId,
        service_id: serviceId,
        is_enabled: newStatus,
      });

      if (res.data && res.data.success) {
        showToast.success(`Layanan ${serviceCode} untuk Bidang ${bidangCode} berhasil diubah ke ${newStatus ? 'Aktif' : 'Nonaktif'}.`);
        setMatrix((prev) =>
          prev.map((b) => {
            if (b.bidang_id === bidangId) {
              return {
                ...b,
                services: b.services.map((s) =>
                  s.service_id === serviceId ? { ...s, is_enabled: newStatus } : s
                ),
              };
            }
            return b;
          })
        );
      }
    } catch (err: any) {
      console.error("Gagal meng-update service status:", err);
      showToast.error("Gagal memperbarui status layanan.");
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <ServiceRouteGuard requireAdminAptika>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-[#0b2146] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <ShieldCog size={24} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-[#0b2146] dark:text-white">
                Konfigurasi Layanan Bidang
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pengaturan hak akses modul (Service Permission Toggle) untuk 7 Unit Kerja / Bidang.
              </p>
            </div>
          </div>

          <button
            onClick={fetchMatrix}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 w-fit"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Muat Ulang Data
          </button>
        </div>

        {/* Matrix Table Card */}
        <div className="bg-white dark:bg-[#071733] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold">Memuat matriks layanan bidang...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-[#0b2146] dark:text-slate-200 font-extrabold">
                    <th className="py-4 px-6">Nama Bidang / Unit Kerja</th>
                    <th className="py-4 px-4 text-center">Administrasi Surat</th>
                    <th className="py-4 px-4 text-center">IKI Report</th>
                    <th className="py-4 px-4 text-center">Manajemen Tugas Digital</th>
                    <th className="py-4 px-4 text-center">Magang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {matrix.map((b) => (
                    <tr
                      key={b.bidang_id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-[#0b2146] dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {b.bidang_code}
                          </span>
                          <span className="text-xs font-semibold">{b.bidang_name}</span>
                        </div>
                      </td>

                      {/* Render 4 Toggle Cells */}
                      {["ADMINISTRASI_SURAT", "IKI_REPORT", "MANAJEMEN_TUGAS", "MAGANG"].map(
                        (svcCode) => {
                          const svc = b.services.find((s) => s.code === svcCode);
                          const isEnabled = svc ? svc.is_enabled : false;
                          const key = `${b.bidang_id}-${svc?.service_id}`;
                          const isUpdating = updatingKey === key;

                          return (
                            <td key={svcCode} className="py-4 px-4 text-center">
                              {svc ? (
                                <button
                                  onClick={() =>
                                    handleToggle(
                                      b.bidang_id,
                                      svc.service_id,
                                      isEnabled,
                                      b.bidang_code,
                                      svc.code
                                    )
                                  }
                                  disabled={isUpdating}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all border ${
                                    isEnabled
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100"
                                      : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 hover:bg-slate-200"
                                  }`}
                                >
                                  {isUpdating ? (
                                    <RefreshCw size={12} className="animate-spin" />
                                  ) : isEnabled ? (
                                    <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <XCircle size={13} className="text-slate-400" />
                                  )}
                                  <span>{isEnabled ? "Aktif" : "Nonaktif"}</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[10px]">-</span>
                              )}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ServiceRouteGuard>
  );
}

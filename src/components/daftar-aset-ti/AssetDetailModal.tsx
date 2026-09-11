"use client";

import React from "react";
import { X, Clock, Calendar } from "lucide-react";
import { DaftarAsetTiItem } from "@/services/api";

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: DaftarAsetTiItem | null;
}

export default function AssetDetailModal({
  isOpen,
  onClose,
  asset,
}: AssetDetailModalProps) {
  if (!isOpen || !asset) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const kategoriName = asset.kategori?.nama_kategori || "PC/Monitor";
  const klasifikasiName = asset.klasifikasi?.nama_klasifikasi || "Terbatas/personal";
  const jenisName = asset.jenis?.nama_jenis || "hardware";
  const merekName = asset.merek?.nama_merek || "-";
  const tipeName = asset.tipe?.nama_tipe || "-";
  const penyediaName = asset.penyedia?.nama_penyedia || "-";
  const pjName = asset.penanggung_jawab?.nama_pj || "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Bar: Dark Navy matching Mockup Page 3 */}
        <div className="bg-[#0f172a] px-6 py-5 text-white flex items-start justify-between">
          <div>
            <span className="block text-xs font-mono text-slate-400 mb-1">
              {asset.kode || "-"}
            </span>
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {asset.nama_aset}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded-md tracking-wider">
              {klasifikasiName}
            </span>
            <span className="px-3 py-1 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold uppercase rounded-md tracking-wider">
              {kategoriName}
            </span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase rounded-md tracking-wider">
              {jenisName}
            </span>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                MEREK
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {merekName}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                TIPE
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {tipeName}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                NOMOR SERI
              </p>
              <p className="font-mono text-slate-800 dark:text-slate-100">
                {asset.no_seri || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                TAHUN PEMBELIAN
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {asset.tahun_pembelian || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                GARANSI
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {asset.garansi || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                END OF SUPPORT
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {asset.date_end || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                END OF LIFE
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {asset.tanggal_akhir_masa_pakai || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PENYEDIA
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {penyediaName}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                LOKASI
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {asset.lokasi || "-"}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PENANGGUNG JAWAB
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {pjName}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                SPESIFIKASI TEKNIS
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                {asset.spesifikasi_teknis || asset.spesifikasi?.spesifikasi_teknis || "-"}
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PEMANFAATAN
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                {asset.pemanfaatan || asset.pemanfaatan_rel?.pemanfaatan || "-"}
              </p>
            </div>
          </div>

          {/* Seksi Riwayat Terakhir matching Mockup Page 3 */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">
              <Clock size={16} className="text-slate-500" />
              <span>RIWAYAT TERAKHIR</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">•</span>
                <span>Terakhir di perbarui:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {formatDate(asset.updated_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">•</span>
                <span>Dibuat pada:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {formatDate(asset.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-semibold shadow transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

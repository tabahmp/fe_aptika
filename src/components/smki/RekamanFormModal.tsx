"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Shield, Calendar, User, Edit3, PlusCircle, Loader2 } from "lucide-react";
import { DaftarRekamanItem, LookupData } from "@/services/smki/daftarRekamanService";

interface RekamanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: {
    judul: string;
    klasifikasi_id?: number | null;
    retensi_id?: number | null;
    pemilik_id?: number | null;
  }) => Promise<void>;
  initialData?: DaftarRekamanItem | null;
  lookup: LookupData;
}

export default function RekamanFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  lookup,
}: RekamanFormModalProps) {
  const [judul, setJudul] = useState("");
  const [klasifikasiId, setKlasifikasiId] = useState<number | "">("");
  const [retensiId, setRetensiId] = useState<number | "">("");
  const [pemilikId, setPemilikId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setJudul(initialData.judul || "");
      setKlasifikasiId(initialData.klasifikasi_id || "");
      setRetensiId(initialData.retensi_id || "");
      setPemilikId(initialData.pemilik_id || "");
    } else {
      setJudul("");
      setKlasifikasiId(lookup.klasifikasi[0]?.id || "");
      setRetensiId(lookup.retensi[0]?.id || "");
      setPemilikId(lookup.pemilik[0]?.id || "");
    }
    setError(null);
  }, [initialData, lookup, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      setError("Judul Rekaman tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        judul: judul.trim(),
        klasifikasi_id: klasifikasiId ? Number(klasifikasiId) : null,
        retensi_id: retensiId ? Number(retensiId) : null,
        pemilik_id: pemilikId ? Number(pemilikId) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan data rekaman");
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              {isEdit ? <Edit3 size={20} /> : <PlusCircle size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isEdit ? "Edit Rekaman" : "Tambah Rekaman"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit
                  ? "Perbarui informasi data rekaman yang dipilih"
                  : "Isi formulir untuk menambahkan data rekaman baru"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Judul Rekaman */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Judul Rekaman <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <FileText size={16} />
              </span>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Masukkan judul rekaman..."
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Klasifikasi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Klasifikasi <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Shield size={16} />
              </span>
              <select
                value={klasifikasiId}
                onChange={(e) => setKlasifikasiId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">Pilih Klasifikasi</option>
                {lookup.klasifikasi.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_klasifikasi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Retensi */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Retensi <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <Calendar size={16} />
              </span>
              <select
                value={retensiId}
                onChange={(e) => setRetensiId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">Pilih Retensi</option>
                {lookup.retensi.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_retensi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pemilik */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Pemilik <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400">
                <User size={16} />
              </span>
              <select
                value={pemilikId}
                onChange={(e) => setPemilikId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="">Pilih Pemilik</option>
                {lookup.pemilik.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_pemilik}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

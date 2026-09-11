"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Loader2 } from "lucide-react";
import {
  DaftarAsetTiItem,
  DaftarAsetTiLookupData,
} from "@/services/api";

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: DaftarAsetTiItem | null;
  lookups: DaftarAsetTiLookupData;
  loading?: boolean;
}

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  lookups,
  loading = false,
}: AssetFormModalProps) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    kode: "",
    nama_aset: "",
    klasifikasi_id: "",
    klasifikasi_baru: "",
    jenis_id: "",
    jenis_baru: "",
    kategori_id: "",
    kategori_baru: "",
    no_seri: "",
    merek_id: "",
    merek_baru: "",
    tipe_id: "",
    tipe_baru: "",
    penyedia_id: "",
    penyedia_baru: "",
    tahun_pembelian: "",
    penanggung_jawab_id: "",
    penanggung_jawab_baru: "",
    lokasi: "",
    garansi: "",
    pemanfaatan: "",
    tanggal_akhir_masa_pakai: "",
    date_end: "",
    spesifikasi_teknis: "",
  });

  const [customFields, setCustomFields] = useState({
    klasifikasi: false,
    jenis: false,
    kategori: false,
    merek: false,
    tipe: false,
    penyedia: false,
    penanggung_jawab: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        kode: initialData.kode || "",
        nama_aset: initialData.nama_aset || "",
        klasifikasi_id: initialData.klasifikasi_id ? String(initialData.klasifikasi_id) : "",
        klasifikasi_baru: "",
        jenis_id: initialData.jenis_id ? String(initialData.jenis_id) : "",
        jenis_baru: "",
        kategori_id: initialData.kategori_id ? String(initialData.kategori_id) : "",
        kategori_baru: "",
        no_seri: initialData.no_seri || "",
        merek_id: initialData.merek_id ? String(initialData.merek_id) : "",
        merek_baru: "",
        tipe_id: initialData.tipe_id ? String(initialData.tipe_id) : "",
        tipe_baru: initialData.tipe?.nama_tipe || "",
        penyedia_id: initialData.penyedia_id ? String(initialData.penyedia_id) : "",
        penyedia_baru: "",
        tahun_pembelian: initialData.tahun_pembelian || "",
        penanggung_jawab_id: initialData.penanggung_jawab_id ? String(initialData.penanggung_jawab_id) : "",
        penanggung_jawab_baru: "",
        lokasi: initialData.lokasi || "",
        garansi: initialData.garansi || "",
        pemanfaatan: initialData.pemanfaatan || "",
        tanggal_akhir_masa_pakai: initialData.tanggal_akhir_masa_pakai || "",
        date_end: initialData.date_end || "",
        spesifikasi_teknis: initialData.spesifikasi_teknis || "",
      });
      setCustomFields({
        klasifikasi: false,
        jenis: false,
        kategori: false,
        merek: false,
        tipe: false,
        penyedia: false,
        penanggung_jawab: false,
      });
    } else {
      setFormData({
        kode: "",
        nama_aset: "",
        klasifikasi_id: lookups.klasifikasis[0]?.id ? String(lookups.klasifikasis[0].id) : "",
        klasifikasi_baru: "",
        jenis_id: lookups.jeniss[0]?.id ? String(lookups.jeniss[0].id) : "",
        jenis_baru: "",
        kategori_id: lookups.kategoris[0]?.id ? String(lookups.kategoris[0].id) : "",
        kategori_baru: "",
        no_seri: "",
        merek_id: lookups.mereks[0]?.id ? String(lookups.mereks[0].id) : "",
        merek_baru: "",
        tipe_id: "",
        tipe_baru: "",
        penyedia_id: lookups.penyedias[0]?.id ? String(lookups.penyedias[0].id) : "",
        penyedia_baru: "",
        tahun_pembelian: String(new Date().getFullYear()),
        penanggung_jawab_id: lookups.penanggung_jawabs[0]?.id ? String(lookups.penanggung_jawabs[0].id) : "",
        penanggung_jawab_baru: "",
        lokasi: "Ruang Staff Bidang Aptika",
        garansi: "",
        pemanfaatan: "",
        tanggal_akhir_masa_pakai: "",
        date_end: "",
        spesifikasi_teknis: "",
      });
      setCustomFields({
        klasifikasi: false,
        jenis: false,
        kategori: false,
        merek: false,
        tipe: false,
        penyedia: false,
        penanggung_jawab: false,
      });
    }
  }, [initialData, isOpen, lookups]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Bar: Dark Navy matching Mockup Page 2 & 5 */}
        <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-lg font-bold tracking-wide">
            {isEdit ? `Edit Aset — ${initialData?.nama_aset}` : "Tambah Aset"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Kode Aset & Nama Aset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                KODE ASET *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 1.3.2.10.01.02.001-01"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                NAMA ASET *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: PC HP 001 Monitor 24 inc Lenovo"
                value={formData.nama_aset}
                onChange={(e) => setFormData({ ...formData, nama_aset: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Klasifikasi & Jenis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  KLASIFIKASI
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, klasifikasi: !customFields.klasifikasi })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.klasifikasi ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.klasifikasi ? (
                <input
                  type="text"
                  placeholder="Ketik klasifikasi baru..."
                  value={formData.klasifikasi_baru}
                  onChange={(e) => setFormData({ ...formData, klasifikasi_baru: e.target.value, klasifikasi_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  value={formData.klasifikasi_id}
                  onChange={(e) => setFormData({ ...formData, klasifikasi_id: e.target.value, klasifikasi_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Klasifikasi</option>
                  {lookups.klasifikasis.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_klasifikasi}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  JENIS
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, jenis: !customFields.jenis })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.jenis ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.jenis ? (
                <input
                  type="text"
                  placeholder="Ketik jenis baru..."
                  value={formData.jenis_baru}
                  onChange={(e) => setFormData({ ...formData, jenis_baru: e.target.value, jenis_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  value={formData.jenis_id}
                  onChange={(e) => setFormData({ ...formData, jenis_id: e.target.value, jenis_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Jenis</option>
                  {lookups.jeniss.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nama_jenis}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Row 3: Kategori & Nomor Seri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  KATEGORI
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, kategori: !customFields.kategori })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.kategori ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.kategori ? (
                <input
                  type="text"
                  placeholder="Ketik kategori baru..."
                  value={formData.kategori_baru}
                  onChange={(e) => setFormData({ ...formData, kategori_baru: e.target.value, kategori_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  value={formData.kategori_id}
                  onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value, kategori_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Kategori</option>
                  {lookups.kategoris.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kategori}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                NOMOR SERI
              </label>
              <input
                type="text"
                placeholder="Contoh: 4CE9092CV4"
                value={formData.no_seri}
                onChange={(e) => setFormData({ ...formData, no_seri: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Row 4: Merek & Tipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  MEREK *
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, merek: !customFields.merek })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.merek ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.merek ? (
                <input
                  type="text"
                  placeholder="Ketik nama merek baru..."
                  value={formData.merek_baru}
                  onChange={(e) => setFormData({ ...formData, merek_baru: e.target.value, merek_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  required
                  value={formData.merek_id}
                  onChange={(e) => setFormData({ ...formData, merek_id: e.target.value, merek_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Merek</option>
                  {lookups.mereks.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nama_merek}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                TIPE *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: HP ProDesk 400GS MT"
                value={formData.tipe_baru}
                onChange={(e) => setFormData({ ...formData, tipe_baru: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Row 5: Penyedia & Tahun Pembelian */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  PENYEDIA
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, penyedia: !customFields.penyedia })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.penyedia ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.penyedia ? (
                <input
                  type="text"
                  placeholder="Ketik penyedia/vendor baru..."
                  value={formData.penyedia_baru}
                  onChange={(e) => setFormData({ ...formData, penyedia_baru: e.target.value, penyedia_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  value={formData.penyedia_id}
                  onChange={(e) => setFormData({ ...formData, penyedia_id: e.target.value, penyedia_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Penyedia</option>
                  {lookups.penyedias.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_penyedia}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                TAHUN PEMBELIAN
              </label>
              <input
                type="text"
                placeholder="Contoh: 2019"
                value={formData.tahun_pembelian}
                onChange={(e) => setFormData({ ...formData, tahun_pembelian: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Row 6: Penanggung Jawab & Lokasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase">
                  PENANGGUNG JAWAB *
                </label>
                <button
                  type="button"
                  onClick={() => setCustomFields({ ...customFields, penanggung_jawab: !customFields.penanggung_jawab })}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {customFields.penanggung_jawab ? "Pilih Opsi" : "+ Ketik Baru"}
                </button>
              </div>
              {customFields.penanggung_jawab ? (
                <input
                  type="text"
                  placeholder="Ketik nama penanggung jawab..."
                  value={formData.penanggung_jawab_baru}
                  onChange={(e) => setFormData({ ...formData, penanggung_jawab_baru: e.target.value, penanggung_jawab_id: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              ) : (
                <select
                  required
                  value={formData.penanggung_jawab_id}
                  onChange={(e) => setFormData({ ...formData, penanggung_jawab_id: e.target.value, penanggung_jawab_baru: "" })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  <option value="">Pilih Penanggung Jawab</option>
                  {lookups.penanggung_jawabs.map((pj) => (
                    <option key={pj.id} value={pj.id}>
                      {pj.nama_pj}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                LOKASI *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Ruang Staff Bidang Aptika"
                value={formData.lokasi}
                onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Row 7: Garansi & Pemanfaatan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                GARANSI
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 31/12/2026 atau 3 Tahun"
                  value={formData.garansi}
                  onChange={(e) => setFormData({ ...formData, garansi: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <Calendar size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                PEMANFAATAN
              </label>
              <input
                type="text"
                placeholder="Contoh: Pengawasan Poksinya Indiridie (Coop Triposto, IT)"
                value={formData.pemanfaatan}
                onChange={(e) => setFormData({ ...formData, pemanfaatan: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Row 8: Batas Masa Pakai & Batas Akhir Layanan Dukungan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                BATAS MASA PAKAI PRODUK (END OF LIFE)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 31/12/2030"
                  value={formData.tanggal_akhir_masa_pakai}
                  onChange={(e) => setFormData({ ...formData, tanggal_akhir_masa_pakai: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <Calendar size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
                BATAS AKHIR LAYANAN DUKUNGAN (END OF SUPPORT)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 31/12/2030"
                  value={formData.date_end}
                  onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                <Calendar size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 9: Spesifikasi Teknis (Full width) */}
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1.5">
              SPESIFIKASI TEKNIS
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: RAM: 8G OS; Win 10 Pro ODD DVD RW Mous; VGA 90HJ00F1ID CPU:I7-9700GHZ HDD: 2T RAM 8G OS"
              value={formData.spesifikasi_teknis}
              onChange={(e) => setFormData({ ...formData, spesifikasi_teknis: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-semibold shadow-md hover:shadow transition-all flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Simpan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

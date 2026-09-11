"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface AssetDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function AssetDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: AssetDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 text-center animate-scaleUp">
        <h3 className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 mb-6 leading-relaxed">
          Apakah Anda yakin ingin menghapus data ini?
        </h3>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-24 py-2.5 rounded-lg bg-slate-400 hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Tidak
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="w-24 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            <span>Ya</span>
          </button>
        </div>
      </div>
    </div>
  );
}

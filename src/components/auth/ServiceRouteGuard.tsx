"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/components/ui/Toast";

interface Props {
  children: React.ReactNode;
  requiredService?: "ADMINISTRASI_SURAT" | "IKI_REPORT" | "MANAJEMEN_TUGAS" | "MAGANG";
  requireAdminAptika?: boolean;
  requireAdmin?: boolean;
}

export default function ServiceRouteGuard({
  children,
  requiredService,
  requireAdminAptika,
  requireAdmin,
}: Props) {
  const router = useRouter();
  const { loading, initialized, user, isAdminAptika, hasServicePermission, fetchProfile } =
    useAuthStore();

  useEffect(() => {
    if (!initialized && !loading) {
      fetchProfile();
    }
  }, [initialized, loading, fetchProfile]);

  useEffect(() => {
    if (loading || !initialized) return;

    // Cek hak akses admin (seluruh admin bidang)
    if (requireAdmin && user?.role !== "admin" && !isAdminAptika) {
      showToast.error("Akses ditolak. Fitur Admin Panel hanya diperuntukkan bagi Administrator.");
      router.replace("/dashboard");
      return;
    }

    if (requireAdminAptika && !isAdminAptika && user?.role !== "admin") {
      showToast.error("Akses ditolak. Fitur Admin Panel hanya diperuntukkan bagi Administrator.");
      router.replace("/dashboard");
      return;
    }

    if (requiredService && !hasServicePermission(requiredService)) {
      showToast.error(`Layanan ini sedang dinonaktifkan untuk bidang Anda.`);
      router.replace("/dashboard");
      return;
    }
  }, [loading, initialized, user, isAdminAptika, requiredService, requireAdminAptika, requireAdmin, router, hasServicePermission]);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Memeriksa hak akses layanan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

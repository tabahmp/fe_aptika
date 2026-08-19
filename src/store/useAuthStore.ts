import { create } from "zustand";
import { api } from "@/services/api";

export interface ServicePermission {
  id: number;
  code: "ADMINISTRASI_SURAT" | "IKI_REPORT" | "MANAJEMEN_TUGAS" | "MAGANG";
  name: string;
  is_enabled: boolean;
}

export interface UserBidang {
  id: number;
  code: string;
  name: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  role: string;
}

interface AuthState {
  user: UserProfile | null;
  bidang: UserBidang | null;
  services: ServicePermission[];
  isAdminAptika: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  clearAuth: () => void;
  hasServicePermission: (serviceCode: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  bidang: null,
  services: [],
  isAdminAptika: false,
  loading: true,
  initialized: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/me");
      if (res.data && res.data.success) {
        set({
          user: res.data.user,
          bidang: res.data.bidang,
          services: res.data.services || [],
          isAdminAptika: res.data.is_admin_aptika || false,
          loading: false,
          initialized: true,
        });
      } else {
        set({ loading: false, initialized: true });
      }
    } catch (err: any) {
      console.error("Gagal memuat data /api/me:", err);
      set({
        loading: false,
        initialized: true,
        error: "Gagal memuat profil hak akses pengguna.",
      });
    }
  },

  clearAuth: () => {
    set({
      user: null,
      bidang: null,
      services: [],
      isAdminAptika: false,
      loading: false,
      initialized: false,
      error: null,
    });
  },

  hasServicePermission: (serviceCode: string) => {
    const { isAdminAptika, services } = get();
    if (isAdminAptika) return true;

    const service = services.find((s) => s.code === serviceCode);
    if (!service || !service.is_enabled) return false;

    // Jika layanan induk IKI_REPORT, pastikan minimal 1 sub-service aktif
    if (serviceCode === "IKI_REPORT") {
      const ikiSubServices = [
        "IKI_INTEGRASI",
        "IKI_PENGELOLAAN",
        "IKI_REKAYASA",
        "IKI_SIDEBAR",
        "IKI_SMARTJABAR",
        "IKI_SADAJABAR",
      ];
      const hasAnySubEnabled = services.some(
        (s) => ikiSubServices.includes(s.code) && s.is_enabled
      );
      return hasAnySubEnabled;
    }

    // Jika layanan induk ADMINISTRASI_SURAT, pastikan minimal 1 jenis surat aktif
    if (serviceCode === "ADMINISTRASI_SURAT") {
      const suratSubServices = [
        "SURAT_NOTA_DINAS",
        "SURAT_SPD",
        "SURAT_HASIL_PENTEST",
        "SURAT_KERENTANAN",
        "SURAT_PERMOHONAN_TI",
      ];
      const hasAnySuratEnabled = services.some(
        (s) => suratSubServices.includes(s.code) && s.is_enabled
      );
      return hasAnySuratEnabled;
    }

    return true;
  },
}));

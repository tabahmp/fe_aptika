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

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      user: null,
      bidang: null,
      services: [],
      isAdminAptika: false,
      loading: true,
      initialized: false,
    };
  }
  try {
    const userStr = localStorage.getItem("user");
    const bidangStr = localStorage.getItem("bidang");
    const servicesStr = localStorage.getItem("services");

    const user = userStr ? JSON.parse(userStr) : null;
    const bidang = bidangStr ? JSON.parse(bidangStr) : null;
    const services = servicesStr ? JSON.parse(servicesStr) : [];
    const isAdminAptika = user?.role === "admin" && (user?.bidang_id === 3 || bidang?.code === "APTIKA");

    return {
      user,
      bidang,
      services,
      isAdminAptika: Boolean(isAdminAptika),
      loading: false,
      initialized: Boolean(user && services.length > 0),
    };
  } catch {
    return {
      user: null,
      bidang: null,
      services: [],
      isAdminAptika: false,
      loading: true,
      initialized: false,
    };
  }
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  bidang: initial.bidang,
  services: initial.services,
  isAdminAptika: initial.isAdminAptika,
  loading: initial.loading,
  initialized: initial.initialized,
  error: null,

  fetchProfile: async () => {
    try {
      const res = await api.get("/me");
      if (res.data && res.data.success) {
        const userData = res.data.user;
        const bidangData = res.data.bidang;
        const servicesData = res.data.services || [];
        const adminAptikaStatus = res.data.is_admin_aptika || false;

        // Simpan ke localStorage agar tidak hilang saat refresh
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData));
          if (bidangData) localStorage.setItem("bidang", JSON.stringify(bidangData));
          localStorage.setItem("services", JSON.stringify(servicesData));
        }

        set({
          user: userData,
          bidang: bidangData,
          services: servicesData,
          isAdminAptika: adminAptikaStatus,
          loading: false,
          initialized: true,
          error: null,
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("bidang");
      localStorage.removeItem("services");
    }
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
    const { services } = get();

    // Cari service permission berdasarkan kode layanan
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

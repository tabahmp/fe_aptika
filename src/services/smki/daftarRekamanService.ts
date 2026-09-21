import { api } from "@/services/api";

export interface LookupItem {
  id: number;
  nama_klasifikasi?: string;
  nama_retensi?: string;
  nama_pemilik?: string;
}

export interface DaftarRekamanItem {
  id: number;
  judul: string;
  klasifikasi_id: number | null;
  retensi_id: number | null;
  pemilik_id: number | null;
  created_at: string;
  updated_at: string;
  klasifikasi?: LookupItem | null;
  retensi?: LookupItem | null;
  pemilik?: LookupItem | null;
}

export interface HeaderInfo {
  no_dokumen: string;
  no_revisi: string;
  tanggal_berlaku: string;
}

export interface LookupData {
  klasifikasi: LookupItem[];
  retensi: LookupItem[];
  pemilik: LookupItem[];
}

export interface GetDaftarRekamanParams {
  search?: string;
  klasifikasi_id?: string | number;
  retensi_id?: string | number;
  pemilik_id?: string | number;
  page?: number;
  per_page?: number;
}

export const fetchDaftarRekaman = async (params?: GetDaftarRekamanParams) => {
  const res = await api.get("/smki/daftar-rekaman", { params });
  return res.data;
};

export const fetchDaftarRekamanLookup = async (): Promise<LookupData> => {
  const res = await api.get("/smki/daftar-rekaman/lookup");
  return res.data;
};

export const createDaftarRekaman = async (data: {
  judul: string;
  klasifikasi_id?: number | null;
  retensi_id?: number | null;
  pemilik_id?: number | null;
  nama_klasifikasi?: string;
  nama_retensi?: string;
  nama_pemilik?: string;
}) => {
  const res = await api.post("/smki/daftar-rekaman", data);
  return res.data;
};

export const updateDaftarRekaman = async (
  id: number,
  data: {
    judul?: string;
    klasifikasi_id?: number | null;
    retensi_id?: number | null;
    pemilik_id?: number | null;
    nama_klasifikasi?: string;
    nama_retensi?: string;
    nama_pemilik?: string;
  }
) => {
  const res = await api.put(`/smki/daftar-rekaman/${id}`, data);
  return res.data;
};

export const deleteDaftarRekaman = async (id: number) => {
  const res = await api.delete(`/smki/daftar-rekaman/${id}`);
  return res.data;
};

export const downloadDaftarRekamanDocx = async (params?: any) => {
  const res = await api.get("/smki/daftar-rekaman/export-docx", {
    params,
    responseType: "blob",
  });
  return res.data;
};

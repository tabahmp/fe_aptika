"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  FileText,
  LogIn,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { login, createMagang, getBidangs } from "@/services/api";

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z" />
    </svg>
  );
}

function DecorCircle({ cx, cy, r, opacity }: { cx: number; cy: number; r: number; opacity: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="white" fillOpacity={opacity} />;
}

export default function Home() {
  const router = useRouter();

  // State tampilan panel kanan: "menu" (default) atau "login"
  const [viewMode, setViewMode] = useState<"menu" | "login">("menu");

  // State untuk Form Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // State untuk Modal Form Daftar Magang
  const [isMagangModalOpen, setIsMagangModalOpen] = useState(false);
  const [magangSubmitting, setMagangSubmitting] = useState(false);
  const [magangSuccess, setMagangSuccess] = useState(false);
  const [bidangs, setBidangs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nama: "",
    nama_kampus: "",
    bidang_id: "3", // default APTIKA
    tgl_mulai_magang: "",
    tgl_selesai_magang: "",
    sertifikat: "Belum menerima",
    keterangan: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    getBidangs()
      .then((res) => {
        if (res && res.data) {
          setBidangs(res.data);
          if (res.data.length > 0 && !formData.bidang_id) {
            setFormData((prev) => ({ ...prev, bidang_id: String(res.data[0].id) }));
          }
        }
      })
      .catch((err) => console.error("Gagal memuat bidang:", err));
  }, []);

  // Hitung status magang otomatis
  const computeStatusMagang = (tglMulai: string, tglSelesai: string) => {
    if (!tglMulai || !tglSelesai) return "-";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(tglMulai);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tglSelesai);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Belum mulai";
    if (today > end) return "Selesai magang";
    return "Sedang magang";
  };

  const currentStatus = computeStatusMagang(
    formData.tgl_mulai_magang,
    formData.tgl_selesai_magang
  );

  // Reset form magang
  const resetMagangForm = () => {
    setFormData({
      nama: "",
      nama_kampus: "",
      bidang_id: bidangs.length > 0 ? String(bidangs[0].id) : "3",
      tgl_mulai_magang: "",
      tgl_selesai_magang: "",
      sertifikat: "Belum menerima",
      keterangan: "",
    });
    setCvFile(null);
    setMagangSuccess(false);
  };

  const handleOpenMagangModal = () => {
    resetMagangForm();
    setIsMagangModalOpen(true);
  };

  const handleCloseMagangModal = () => {
    setIsMagangModalOpen(false);
    resetMagangForm();
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const data = await login(email, password);
      const token =
        data.token ||
        data.access_token ||
        data?.data?.token ||
        data?.data?.access_token ||
        "dummy-token-aptika";
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || data?.data?.user || { name: "User APTIKA Tools" }
        )
      );
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setLoginError(err.response?.data?.message || "Email atau password salah.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Submit Magang Form
  const handleSaveMagang = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cvFile && cvFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file CV Magang tidak boleh melebihi 2MB");
      return;
    }

    setMagangSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("nama", formData.nama);
      payload.append("nama_kampus", formData.nama_kampus);
      payload.append("bidang_id", formData.bidang_id);
      payload.append("tgl_mulai_magang", formData.tgl_mulai_magang);
      payload.append("tgl_selesai_magang", formData.tgl_selesai_magang);
      payload.append("sertifikat", formData.sertifikat);
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);
      if (cvFile) {
        payload.append("cv_magang", cvFile);
      }
      if (formData.keterangan) payload.append("keterangan", formData.keterangan);
      if (cvFile) {
        payload.append("cv_magang", cvFile);
      }

      await createMagang(payload);
      setMagangSuccess(true);
    } catch (error: any) {
      if (error?.response?.status === 413) {
        alert("Gagal menyimpan data: Ukuran file terlalu besar (Maksimal 2MB)");
      } else if (error?.response?.data?.message) {
        alert(`Gagal menyimpan data: ${error.response.data.message}`);
      } else {
        alert("Gagal menyimpan data. Pastikan semua field telah diisi dengan benar.");
      }
      console.error("Error submitting magang application:", error);
    } finally {
      setMagangSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .page { font-family: 'Plus Jakarta Sans', sans-serif; min-height: 100vh; display: flex; }

        /* LEFT PANEL (Persis Gambar 2) */
        .panel-left {
          flex: 1; position: relative; overflow: hidden;
          display: flex; flex-direction: column; justify-content: center;
          padding: 64px 56px;
          background: linear-gradient(145deg, rgba(15,37,64,0.88) 0%, rgba(26,58,110,0.85) 45%, rgba(29,78,216,0.82) 100%), url('/bg-diskominfo.png') center/cover no-repeat;
        }
        .left-decor { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .left-accent {
          position: absolute; right: 0; top: 0; bottom: 0; width: 3px;
          background: linear-gradient(to bottom, transparent, #38bdf8, transparent);
          opacity: 0.5;
        }
        .left-content { position: relative; z-index: 2; max-width: 440px; }
        .left-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }
        .left-logo-name { font-size: 20px; font-weight: 800; color: white; letter-spacing: 1px; }
        .left-logo-sub { font-size: 10.5px; color: rgba(255,255,255,0.6); margin-top: 3px; }

        .left-tagline {
          font-size: 40px; font-weight: 800; color: white;
          line-height: 1.15; letter-spacing: -0.8px; margin-bottom: 18px;
        }
        .left-tagline .accent { color: #38bdf8; }

        .left-desc { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.75; margin-bottom: 40px; }

        .left-stats { display: flex; gap: 16px; flex-wrap: wrap; }
        .stat-card {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px; padding: 14px 20px; backdrop-filter: blur(8px);
          flex: 1; min-width: 110px;
        }
        .stat-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .stat-val { font-size: 15px; font-weight: 700; color: white; }

        /* RIGHT PANEL (Presisi Vertikal di Tengah Sempurna) */
        .panel-right {
          width: 480px; flex-shrink: 0; background: #ffffff;
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 64px 48px 60px 48px; position: relative; min-height: 100vh;
        }
        .panel-right::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #0f2540, #1d4ed8, #38bdf8);
        }
        .form-inner { width: 100%; margin: auto 0; animation: fadeRight 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes fadeRight { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }

        .form-eyebrow { font-size: 11px; font-weight: 700; color: #0891b2; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; }
        .form-title { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.6px; margin-bottom: 8px; }
        .form-sub { font-size: 13.5px; color: #94a3b8; margin-bottom: 32px; line-height: 1.55; }

        /* MENU BUTTON CARDS FOR HOME VIEW */
        .menu-list { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }
        .menu-item-btn {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px; border-radius: 14px; border: 1.5px solid #e2e8f0;
          background: #f8fafc; cursor: pointer; transition: all 0.25s ease;
        }
        .menu-item-btn:hover {
          border-color: #1d4ed8; background: #ffffff;
          box-shadow: 0 10px 24px -4px rgba(29, 78, 216, 0.12);
          transform: translateY(-2px);
        }
        .menu-item-left { display: flex; align-items: center; gap: 14px; }
        .menu-item-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .menu-item-title { font-size: 14.5px; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
        .menu-item-desc { font-size: 12px; color: #64748b; line-height: 1.4; }
        .menu-item-action { font-size: 12.5px; font-weight: 700; display: flex; align-items: center; gap: 4px; white-space: nowrap; }

        /* INPUT GROUPS FOR LOGIN FORM */
        .input-group { margin-bottom: 22px; }
        .input-label { display: block; font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.9px; text-transform: uppercase; margin-bottom: 8px; }
        .input-wrap {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 0 16px; height: 50px; background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .input-wrap:focus-within { border-color: #1d4ed8; background: white; box-shadow: 0 0 0 3px rgba(29,78,216,0.09); }
        .input-icon { color: #cbd5e1; flex-shrink: 0; display: flex; align-items: center; transition: color 0.2s; }
        .input-wrap:focus-within .input-icon { color: #1d4ed8; }
        .input-wrap input { flex: 1; border: none; outline: none; font-size: 14px; color: #0f172a; background: transparent; font-family: 'Plus Jakarta Sans', sans-serif; }
        .input-wrap input::placeholder { color: #cbd5e1; font-size: 13.5px; }

        .toggle-pass { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0; font-size: 11px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; transition: color 0.2s; white-space: nowrap; }
        .toggle-pass:hover { color: #1d4ed8; }

        .error-msg { background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 11px 16px; font-size: 12.5px; color: #dc2626; text-align: center; margin-bottom: 18px; }

        .btn-login {
          width: 100%; height: 52px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #0f2540 0%, #1d4ed8 60%, #0891b2 100%);
          color: white; font-size: 15px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: all 0.2s; margin-top: 6px; margin-bottom: 20px;
        }
        .btn-login:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 12px 28px rgba(29,78,216,0.32); }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.65s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-back-menu {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; color: #64748b; background: none; border: none;
          cursor: pointer; padding: 4px 0; margin-bottom: 18px; transition: color 0.2s;
        }
        .btn-back-menu:hover { color: #1d4ed8; }

        .form-footer {
          position: absolute; bottom: 24px; left: 48px; right: 48px;
          border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;
        }
        .footer-org { font-size: 12px; font-weight: 600; color: #64748b; }

        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .panel-left { padding: 40px 32px; min-height: auto; }
          .left-tagline { font-size: 28px; }
          .panel-right { width: 100%; padding: 48px 24px 60px 24px; min-height: auto; }
          .form-footer { position: relative; bottom: auto; margin-top: 32px; left: 0; right: 0; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT PANEL (Persis Gambar 2) ── */}
        <div className="panel-left">
          <svg className="left-decor" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice">
            <DecorCircle cx={580} cy={120} r={220} opacity={0.05} />
            <DecorCircle cx={600} cy={160} r={140} opacity={0.06} />
            <DecorCircle cx={80}  cy={800} r={200} opacity={0.05} />
            <DecorCircle cx={60}  cy={820} r={100} opacity={0.06} />
            <DecorCircle cx={350} cy={460} r={300} opacity={0.03} />
          </svg>
          <div className="left-accent" />

          <div className="left-content">
            <div className="left-logo">
              <div>
                <div className="left-logo-name">APTIKA Tools</div>
                <div className="left-logo-sub">Rekap Data Aptika</div>
              </div>
            </div>

            <div className="left-tagline">
              <span className="accent">Aptika Tools</span><br />
              Jawa Barat
            </div>

            <p className="left-desc">
              Platform pengelolaan dan rekap data Aplikasi Informatika Dinas
              Komunikasi dan Informatika Provinsi Jawa Barat. Data akurat,
              terpadu, dan mudah diakses.
            </p>

            <div className="left-stats">
              <div className="stat-card">
                <div className="stat-label">INSTANSI</div>
                <div className="stat-val">Diskominfo Jabar</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">BIDANG</div>
                <div className="stat-val">Aptika</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Presisi Vertikal Tengah Tanpa Top Menu Header) ── */}
        <div className="panel-right">
          {/* ── CONTENT CONTAINER (TERPUSAT DI TENGAH) ── */}
          <div className="form-inner">
            {viewMode === "menu" ? (
              /* ── TAMPILAN PERTAMA: PILIHAN MENU ── */
              <div>
                <div className="form-eyebrow">SELAMAT DATANG</div>
                <h2 className="form-title">APTIKA Tools Jawa Barat</h2>
                <p className="form-sub">
                  Silakan pilih menu permohonan atau masuk ke portal sistem di bawah ini.
                </p>

                <div className="menu-list">
                  {/* 1. TOMBOL LOGIN */}
                  <div
                    onClick={() => setViewMode("login")}
                    className="menu-item-btn group"
                  >
                    <div className="menu-item-left">
                      <div className="menu-item-icon bg-blue-50 text-blue-600">
                        <LogIn size={20} />
                      </div>
                      <div>
                        <div className="menu-item-title">Masuk / Login Sistem</div>
                        <div className="menu-item-desc">Akses untuk staf administrator & pengelola</div>
                      </div>
                    </div>
                    <span className="menu-item-action text-blue-600 group-hover:translate-x-1 transition-transform">
                      Masuk <ChevronRight size={16} />
                    </span>
                  </div>

                  {/* 2. TOMBOL DAFTAR MAGANG (LANGSUNG MEMBUKA MODAL FORM) */}
                  <div
                    onClick={handleOpenMagangModal}
                    className="menu-item-btn group"
                  >
                    <div className="menu-item-left">
                      <div className="menu-item-icon bg-sky-50 text-sky-600">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <div className="menu-item-title">Daftar Magang</div>
                        <div className="menu-item-desc">Isi formulir pendaftaran magang secara online</div>
                      </div>
                    </div>
                    <span className="menu-item-action text-sky-600 group-hover:translate-x-1 transition-transform">
                      Buka Form <ChevronRight size={16} />
                    </span>
                  </div>

                  {/* 3. TOMBOL RFC */}
                  <div
                    onClick={() => router.push("/form-perubahan-it")}
                    className="menu-item-btn group"
                  >
                    <div className="menu-item-left">
                      <div className="menu-item-icon bg-indigo-50 text-indigo-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="menu-item-title">Permohonan RFC</div>
                        <div className="menu-item-desc">Formulir pengajuan perubahan sistem & IT</div>
                      </div>
                    </div>
                    <span className="menu-item-action text-indigo-600 group-hover:translate-x-1 transition-transform">
                      Pengajuan <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* ── TAMPILAN KEDUA: FORM INPUT LOGIN (TAMPIL SAAT DIPENCET) ── */
              <div>
                <button
                  type="button"
                  onClick={() => setViewMode("menu")}
                  className="btn-back-menu"
                >
                  <ArrowLeft size={14} />
                  Kembali ke Menu Utama
                </button>

                <div className="form-eyebrow">PORTAL MASUK</div>
                <h2 className="form-title">Masuk ke APTIKA Tools</h2>
                <p className="form-sub">Masukkan kredensial Anda untuk mengakses sistem.</p>

                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label className="input-label">EMAIL</label>
                    <div className="input-wrap">
                      <span className="input-icon"><UserIcon /></span>
                      <input
                        type="email"
                        placeholder="email@aptika.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">PASSWORD</label>
                    <div className="input-wrap">
                      <span className="input-icon"><LockIcon /></span>
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="toggle-pass"
                        onClick={() => setShowPass(!showPass)}
                        tabIndex={-1}
                      >
                        {showPass ? "Sembunyikan" : "Tampilkan"}
                      </button>
                    </div>
                  </div>

                  {loginError && <div className="error-msg">{loginError}</div>}

                  <button type="submit" disabled={loginLoading} className="btn-login">
                    <div className="btn-inner">
                      {loginLoading && <div className="spinner" />}
                      {loginLoading ? "Memproses..." : "Masuk"}
                    </div>
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="form-footer">
            <div className="footer-org">Diskominfo Provinsi Jawa Barat</div>
          </div>
        </div>
      </div>

      {/* ── MODAL FORM DAFTAR MAGANG ── */}
      <Modal
        isOpen={isMagangModalOpen}
        onClose={handleCloseMagangModal}
        title={magangSuccess ? "Pendaftaran Berhasil" : "Tambah Data Magang"}
        size="lg"
      >
        {magangSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil Dikirim!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Terima kasih, data pendaftaran magang Anda telah berhasil disimpan. Tim APTIKA Diskominfo Jabar akan memverifikasi berkas Anda.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleCloseMagangModal}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveMagang} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan nama"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kampus / Sekolah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_kampus}
                  onChange={(e) => setFormData({ ...formData, nama_kampus: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Masukkan institusi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Bidang Tujuan Magang <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.bidang_id}
                  onChange={(e) => setFormData({ ...formData, bidang_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white"
                >
                  <option value="">-- Pilih Bidang / Unit Kerja --</option>
                  {bidangs.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tgl_mulai_magang}
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_mulai_magang: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tgl_selesai_magang}
                  onChange={(e) =>
                    setFormData({ ...formData, tgl_selesai_magang: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Magang
                </label>
                <div
                  className={`w-full rounded-lg px-3 py-2 text-sm font-semibold border ${
                    currentStatus === "Sedang magang"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : currentStatus === "Selesai magang"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : currentStatus === "Belum mulai"
                      ? "bg-slate-50 text-slate-700 border-slate-200"
                      : "bg-slate-50 text-slate-400 border-slate-200"
                  }`}
                >
                  {currentStatus}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Sertifikat
                </label>
                <select
                  required
                  value={formData.sertifikat}
                  onChange={(e) => setFormData({ ...formData, sertifikat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="Belum menerima">Belum menerima</option>
                  <option value="Sudah menerima">Sudah menerima</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload CV (PDF/JPG/PNG) <span className="text-red-500">* (Maks 2MB)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keterangan (Opsional)
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                rows={3}
                placeholder="Masukkan keterangan jika ada..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseMagangModal}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={magangSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {magangSubmitting ? "Mengirim..." : "Kirim Data"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
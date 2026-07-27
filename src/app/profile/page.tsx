"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Avatar from "@/components/ui/Avatar";
import { showToast } from "@/components/ui/Toast";
import { getProfile, updateProfile } from "@/services/api";
import { useTaskStore } from "@/store/useTaskStore";
import { User, Mail, Briefcase, Phone, Save, RotateCcw, CheckCircle, Shield, Camera, Trash2, Upload } from "lucide-react";

export default function ProfilePage() {
  const { currentUser, setCurrentUser, loadCurrentUser } = useTaskStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadCurrentUser();

    // 1. Immediately read user from localStorage or Zustand store for instant render
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          const user = JSON.parse(uStr);
          if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setPosition(user.position || user.jabatan || "");
            setPhone(user.phone || user.no_telp || "");
            setLoading(false);
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }

    // 2. Fetch latest data from backend in background
    fetchUserProfile();
  }, [loadCurrentUser]);

  const fetchUserProfile = async () => {
    setErrorMsg("");
    try {
      const res = await getProfile();
      const userData = res?.user || res;
      if (userData && typeof userData === "object") {
        setName(userData.name || "");
        setEmail(userData.email || "");
        setPosition(userData.position || userData.jabatan || "");
        setPhone(userData.phone || userData.no_telp || "");
        
        // Sync with localStorage & store
        localStorage.setItem("user", JSON.stringify(userData));
        setCurrentUser(userData);
      }
    } catch (err: any) {
      console.warn("Could not sync profile with backend, using local data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      showToast.error("File harus berupa gambar (JPG, PNG, WEBP)");
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error("Ukuran gambar tidak boleh melebihi 2MB");
      return;
    }

    setAvatarFile(file);

    // Read as Base64 Data URL for guaranteed persistence on ephemeral cloud filesystems
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      setAvatarPreview(base64Str);
    };
    reader.readAsDataURL(file);

    setRemoveAvatar(false);
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      let res;
      if (avatarFile || avatarPreview || removeAvatar) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("position", position || "");
        formData.append("jabatan", position || "");
        formData.append("phone", phone || "");
        formData.append("no_telp", phone || "");

        if (removeAvatar) {
          formData.append("remove_avatar", "1");
        } else if (avatarFile) {
          formData.append("avatar", avatarFile);
        } else if (avatarPreview && avatarPreview.startsWith("data:image/")) {
          formData.append("avatar", avatarPreview);
        }

        res = await updateProfile(formData);
      } else {
        const payload = {
          name,
          email,
          position,
          jabatan: position,
          phone,
          no_telp: phone,
        };
        res = await updateProfile(payload);
      }

      const updatedUser = res?.user || {
        ...currentUser,
        name,
        email,
        position,
        jabatan: position,
        phone,
        no_telp: phone,
      };

      // Reset avatar draft flags
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);

      // Sync local state & Zustand store
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      setSuccessMsg("Profil berhasil diperbarui!");
      showToast.success("Profil Anda berhasil diperbarui.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal memperbarui profil. Periksa koneksi atau input Anda.";
      setErrorMsg(msg);
      showToast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchUserProfile();
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccessMsg("");
    setErrorMsg("");
  };

  // Determine current active avatar image URL
  const currentAvatarSrc = removeAvatar 
    ? undefined 
    : (avatarPreview || currentUser?.avatar_url || currentUser?.avatar);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Header 
          title="Profil Saya" 
          subtitle="Pengaturan dan pengelolaan data informasi pribadi pengguna" 
          showBrand={false} 
        />

        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Avatar container with hover camera icon */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar name={name || currentUser?.name || "User"} src={currentAvatarSrc} size="xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} />
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-600 border-2 border-white text-white p-1 rounded-full shadow-sm">
                <User size={12} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-slate-800">
                  {name || currentUser?.name || "Memuat..."}
                </h2>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  currentUser?.role === "admin" 
                    ? "bg-purple-100 text-purple-700 border border-purple-200" 
                    : "bg-blue-100 text-blue-700 border border-blue-200"
                }`}>
                  <Shield size={12} />
                  {currentUser?.role === "admin" ? "Administrator" : "User / Member"}
                </span>
              </div>

              <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={14} className="text-slate-400" />
                {email || currentUser?.email || "Belum diatur"}
              </p>

              {(position || phone) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-600">
                  {position && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Briefcase size={12} className="text-blue-500" />
                      {position}
                    </span>
                  )}
                  {phone && (
                    <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Phone size={12} className="text-emerald-500" />
                      {phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Perubahan Profil */}
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Formulir Edit Profil</h3>
              <p className="text-xs text-slate-500">Perbarui data informasi akun, foto profil, dan kontak Anda di bawah ini.</p>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium animate-fadeIn">
                <CheckCircle size={18} className="flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-fadeIn">
                {errorMsg}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Memuat data profil...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg,image/png,image/jpg,image/webp" 
                  className="hidden" 
                />

                {/* Photo Upload Section */}
                <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <Avatar name={name || currentUser?.name || "User"} src={currentAvatarSrc} size="lg" />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <h4 className="text-xs font-bold text-slate-700">Foto Profil</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload foto diri dalam format JPG, PNG, atau WEBP (Maks. 2MB).
                    </p>
                    {avatarFile && (
                      <p className="text-[11px] font-semibold text-blue-600">
                        File terpilih: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-all shadow-xs"
                    >
                      <Upload size={13} className="text-blue-600" />
                      <span>{currentAvatarSrc ? "Ganti Foto" : "Unggah Foto"}</span>
                    </button>

                    {(currentAvatarSrc || avatarFile) && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-all shadow-xs"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Perubahan Nama */}
                  <div className="space-y-2">
                    <label htmlFor="input-name" className="block text-xs font-semibold text-slate-700">
                      Perubahan Nama <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        id="input-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama lengkap"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* 2. Perubahan Email */}
                  <div className="space-y-2">
                    <label htmlFor="input-email" className="block text-xs font-semibold text-slate-700">
                      Perubahan Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input
                        id="input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh@diskominfo.jabarprov.go.id"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* 3. Jabatan */}
                  <div className="space-y-2">
                    <label htmlFor="input-position" className="block text-xs font-semibold text-slate-700">
                      Jabatan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Briefcase size={16} />
                      </div>
                      <input
                        id="input-position"
                        type="text"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Contoh: Pranata Komputer Ahli Muda"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* 4. No Telp */}
                  <div className="space-y-2">
                    <label htmlFor="input-phone" className="block text-xs font-semibold text-slate-700">
                      No. Telp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        id="input-phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

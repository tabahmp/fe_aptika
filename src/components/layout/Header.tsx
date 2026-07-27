"use client";

import { useEffect, useState, useRef } from "react";
import { Search, User, Sun, Moon } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { logout } from "@/services/api";
import { useTaskStore } from "@/store/useTaskStore";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useTheme } from "@/components/providers/ThemeProvider";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBrand?: boolean;
}

export default function Header({ title, subtitle, showBrand = false }: HeaderProps) {
  const router = useRouter();
  const { currentUser, loadCurrentUser } = useTaskStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const userName = currentUser?.name || "User";
  const isAdmin = currentUser?.role === "admin";

  const handleLogout = async () => {
    try { 
      await logout(); 
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const profileMenuItems = [
    {
      label: "Profil Saya",
      onClick: () => router.push("/profile"),
      icon: <User size={14} />,
    },
    {
      label: "Keluar",
      onClick: handleLogout,
      icon: <User size={14} className="text-red-400" />,
      destructive: true,
    },
  ];

  return (
<<<<<<< HEAD
    <header className="flex items-center justify-between bg-white/60 dark:bg-[#071733]/90 backdrop-blur-md border border-white/70 dark:border-slate-800 rounded-2xl px-6 py-4 shadow-sm select-none relative z-30 transition-colors duration-300">
=======
    <header className="flex items-center justify-between bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl px-6 py-4 shadow-sm select-none relative z-30 print:hidden">
>>>>>>> a50f5500e63df33d7842eccdbefe9a04c8c432d3
      {/* Title / Brand Area */}
      {showBrand ? (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push("/dashboard")}
          title="Kembali ke Beranda"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0b2146] via-[#163868] to-[#1d4ed8] flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-wider leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              APTIKA TOOLS
            </h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase">
              Diskominfo Jawa Barat
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          <h1 className="text-base font-extrabold text-slate-800 dark:text-white tracking-wide leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-semibold tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-amber-400 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-amber-300 transition-all active:scale-95"
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-amber-400 animate-in spin-in-90 duration-200" />
          ) : (
            <Moon size={18} className="text-slate-600 animate-in fade-in duration-200" />
          )}
        </button>

        <NotificationBell />

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

        {/* Profile Selector */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
              <Avatar name={userName} size="sm" indicator="online" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate leading-none">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold tracking-wide mt-0.5">
                  {isAdmin ? "Admin" : "Developer"}
                </span>
              </div>
            </div>
          }
          items={profileMenuItems}
        />
      </div>
    </header>
  );
}
export { Header };


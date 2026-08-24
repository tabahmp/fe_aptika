"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ToggleRight,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Eye,
  Sun,
  Moon,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as apiLogout } from "@/services/api";
import { useTheme } from "@/components/providers/ThemeProvider";

const ADMIN_NAV = [
  {
    group: "Utama",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard & Audit Log",
        icon: LayoutDashboard,
        superAdminOnly: false,
      },
      {
        href: "/admin/users",
        label: "Manajemen Pengguna",
        icon: Users,
        superAdminOnly: false,
      },
    ],
  },
  {
    group: "Konfigurasi",
    items: [
      {
        href: "/admin/service-matrix",
        label: "Matriks Layanan",
        icon: ToggleRight,
        superAdminOnly: true,
      },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, bidang, isAdminAptika, clearAuth } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted]         = useState(false);

  const isSuperAdmin =
    isAdminAptika ||
    (user?.role === "admin" && (bidang?.code === "APTIKA" || (user as any)?.bidang_id === 3));

  useEffect(() => {
    setMounted(true);
    const token       = localStorage.getItem("token");
    const storedUser  = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || storedUser?.role !== "admin") {
      router.replace("/");
    }
  }, [router]);

  if (!mounted) return null;

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    clearAuth();
    router.replace("/");
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#060d1f] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
      {/* ── Sidebar Admin ── */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-white dark:bg-[#0b1630] border-r border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-red-500/20">
            <ShieldAlert size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate">
                APTIKA Tools
              </p>
              <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold truncate">
                Admin Panel
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {ADMIN_NAV.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.superAdminOnly || isSuperAdmin
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                {sidebarOpen && (
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2 mb-2">
                    {group.group}
                  </p>
                )}
                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon     = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={!sidebarOpen ? item.label : undefined}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                            isActive
                              ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25 font-semibold"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200"
                          }`}
                        >
                          <Icon size={17} className="flex-shrink-0" />
                          {sidebarOpen && (
                            <span className="truncate flex-1">{item.label}</span>
                          )}
                          {sidebarOpen && isActive && (
                            <ChevronRight
                              size={13}
                              className="ml-auto text-red-500 dark:text-red-400/60"
                            />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          {sidebarOpen && (
            <div className="px-2 mb-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              <span className="mt-1 inline-block text-[9px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold uppercase tracking-wider">
                {isSuperAdmin ? "Super Admin" : "Admin Bidang"}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={!sidebarOpen ? "Keluar" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all duration-150"
          >
            <LogOut size={17} className="flex-shrink-0" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#080f22] backdrop-blur-md flex-shrink-0 shadow-sm transition-colors duration-200">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Panel Administrator</h2>
            <p className="text-xs text-slate-500">
              Diskominfo Provinsi Jawa Barat
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button (Light / Dark) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#0b1630] text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center shadow-sm"
              title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun size={16} className="text-amber-400" />
              ) : (
                <Moon size={16} className="text-slate-600" />
              )}
            </button>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/25 transition-all shadow-sm"
            >
              <Eye size={13} />
              <span>Buka Layanan Bidang</span>
              <ExternalLink size={11} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}

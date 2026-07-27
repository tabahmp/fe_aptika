"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/api";
import {
  Network,
  FileText,
  Layers,
  Cpu,
  LayoutTemplate,
  Smartphone,
  Database,
  Briefcase,
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useSidebarStore } from "@/store/useSidebarStore";

const MENU_ITEMS = [
  {
    type: "single" as const,
    name: "Administrasi Surat",
    key: "administrasisurat",
    icon: FileText,
    iconColor: "text-amber-600 bg-amber-50 border border-amber-200/60"
  },
  {
    type: "group" as const,
    name: "IKI Report",
    icon: Layers,
    iconColor: "text-purple-600 bg-purple-50 border border-purple-200/60",
    subItems: [
      {
        name: "Integrasi Interoperabilitas",
        key: "integrasiinteroperabilitas",
        icon: Network,
        iconColor: "text-blue-600 bg-blue-50 border border-blue-200/60"
      },
      {
        name: "Pengelolaan Aplikasi",
        key: "pengelolaanaplikasi",
        icon: Layers,
        iconColor: "text-purple-600 bg-purple-50 border border-purple-200/60"
      },
      {
        name: "Rekayasa Aplikasi",
        key: "rekayasaaplikasi",
        icon: Cpu,
        iconColor: "text-cyan-600 bg-cyan-50 border border-cyan-200/60"
      },
      {
        name: "Sidebar Jabar",
        key: "sidebarjabar",
        icon: LayoutTemplate,
        iconColor: "text-emerald-600 bg-emerald-50 border border-emerald-200/60"
      },
      {
        name: "Smart Jabar",
        key: "smartjabar",
        icon: Smartphone,
        iconColor: "text-violet-600 bg-violet-50 border border-violet-200/60"
      },
      {
        name: "Sada Jabar",
        key: "sadajabar",
        icon: Database,
        iconColor: "text-sky-600 bg-sky-50 border border-sky-200/60"
      },
    ]
  },
  {
    type: "single" as const,
    name: "Manajemen Tugas Digital",
    key: "manajementugasdigital",
    icon: Briefcase,
    iconColor: "text-rose-600 bg-rose-50 border border-rose-200/60"
  },
  {
    type: "single" as const,
    name: "Magang",
    key: "magang",
    icon: Users,
    iconColor: "text-indigo-600 bg-indigo-50 border border-indigo-200/60"
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isOpenMobile, toggleCollapsed, setOpenMobile, initStore } = useSidebarStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("User");

  const activeSegment = pathname.split("/")[1] || "dashboard";

  const appGroupKeys = ["integrasiinteroperabilitas", "pengelolaanaplikasi", "rekayasaaplikasi", "sidebarjabar", "smartjabar", "sadajabar"];
  const isAppGroupActive = appGroupKeys.includes(activeSegment);

  const [isAppGroupOpen, setIsAppGroupOpen] = useState(isAppGroupActive);

  useEffect(() => {
    if (isAppGroupActive) {
      setIsAppGroupOpen(true);
    }
  }, [isAppGroupActive]);

  useEffect(() => {
    initStore();
    if (typeof window !== "undefined") {
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const uObj = JSON.parse(uStr);
          setUserName(uObj?.name || "User");
          if (uObj?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [initStore]);

  const handleTeamClick = (key: string) => {
    setOpenMobile(false);
    if (key === "dashboard") {
      router.push("/dashboard");
    } else if (key === "administrasisurat" || key === "manajementugasdigital") {
      router.push(`/${key}`);
    } else {
      router.push(`/${key}/dashboard`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    } catch { }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <>
      {/* Hamburger Toggle Button for Mobile/Tablet */}
      {!isOpenMobile && (
        <button
<<<<<<< HEAD
          className="fixed top-4 left-4 z-50 flex items-center justify-center lg:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#0b2146] shadow-md hover:bg-slate-50 transition-all duration-200"
=======
          className="fixed top-4 left-4 z-50 flex items-center justify-center lg:hidden w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-md hover:bg-slate-800 transition-all duration-200 print:hidden"
>>>>>>> a50f5500e63df33d7842eccdbefe9a04c8c432d3
          onClick={() => setOpenMobile(true)}
          aria-label="Toggle Menu"
        >
          <PanelLeftOpen size={20} />
        </button>
      )}

      {/* Overlay Backdrop for Mobile/Tablet */}
      {isOpenMobile && (
        <div
<<<<<<< HEAD
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity duration-200"
=======
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-200 print:hidden"
>>>>>>> a50f5500e63df33d7842eccdbefe9a04c8c432d3
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* Sidebar Navigation - Adaptive Light/Dark Theme */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col h-screen
        bg-white text-[#0b2146] border-r border-slate-200 shadow-sm
        dark:bg-[#071733] dark:text-white dark:border-slate-800/80
        transition-all duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:flex-shrink-0
        print:hidden
        ${isCollapsed ? "w-[76px]" : "w-[260px]"}
        ${isOpenMobile ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand Header */}
        <div
          className={`flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#071733] ${isCollapsed ? "px-3 py-5" : "px-6 py-6"}`}
        >
          {isCollapsed ? (
            <button
              onClick={toggleCollapsed}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0b2146] dark:text-white transition-all animate-in fade-in duration-200"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div
                className="cursor-pointer flex-grow animate-in fade-in duration-200"
                onClick={() => router.push("/dashboard")}
              >
                <h1 className="text-[15px] font-extrabold tracking-wide uppercase text-[#0b2146] dark:text-white">
                  Aptika Tools
                </h1>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-0.5">
                  Rekap Data Aptika
                </p>
              </div>
              <button
                onClick={toggleCollapsed}
                className="flex p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#0b2146] dark:hover:text-white transition-all ml-2"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-7 scrollbar-hide bg-white dark:bg-[#071733]">
          {/* Services Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <span className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-widest uppercase select-none">
                Service
              </span>
            )}
            <div className="pt-2 space-y-1">
              {MENU_ITEMS.map((item) => {
                if (item.type === "single") {
                  const Icon = item.icon;
                  const isActive = activeSegment === item.key;
                  return (
                    <button
                      key={item.key}
                      title={isCollapsed ? item.name : undefined}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold
                        transition-all duration-150 select-none outline-none group
                        ${isCollapsed ? "justify-center px-2" : ""}
                        ${isActive
                          ? "bg-blue-50/80 text-[#0b2146] font-extrabold shadow-xs border border-blue-200/70 dark:bg-[#1d4ed8] dark:text-white dark:border-blue-500/50 dark:shadow-blue-500/20"
                          : "text-[#0b2146]/90 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0b2146] dark:hover:text-white font-bold"
                        }
                      `}
                      onClick={() => handleTeamClick(item.key)}
                    >
                      <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${item.iconColor}`}>
                        <Icon size={16} />
                      </div>
                      {!isCollapsed && <span className="flex-1 truncate text-[12.5px]">{item.name}</span>}
                      {isActive && (
                        <span className={`w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_6px_rgba(37,99,235,0.6)] ${isCollapsed ? "absolute right-2" : ""}`} />
                      )}
                    </button>
                  );
                } else {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        title={isCollapsed ? item.name : undefined}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold
                          transition-all duration-150 select-none outline-none group
                          ${isCollapsed ? "justify-center px-2" : ""}
                          ${isAppGroupActive
                            ? "bg-purple-50/80 text-[#0b2146] font-extrabold shadow-xs border border-purple-200/70 dark:bg-[#1d4ed8]/80 dark:text-white dark:border-blue-500/50"
                            : "text-[#0b2146]/90 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0b2146] dark:hover:text-white font-bold"
                          }
                        `}
                        onClick={() => {
                          if (isCollapsed) {
                            toggleCollapsed();
                            setIsAppGroupOpen(true);
                          } else {
                            setIsAppGroupOpen((prev) => !prev);
                          }
                        }}
                      >
                        <div className={`p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${item.iconColor}`}>
                          <Icon size={16} />
                        </div>
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 truncate text-[12.5px] font-bold">{item.name}</span>
                            <div className="text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors ml-1">
                              {isAppGroupOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </div>
                          </>
                        )}
                        {isCollapsed && isAppGroupActive && (
                          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-sky-400 shadow-[0_0_6px_rgba(147,51,234,0.6)] absolute right-2" />
                        )}
                      </button>

                      {/* Sub-items dropdown list */}
                      {!isCollapsed && isAppGroupOpen && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 pt-1 animate-in fade-in duration-200">
                          {item.subItems.map((sub) => {
                            const SubIcon = sub.icon;
                            const isSubActive = activeSegment === sub.key;
                            return (
                              <button
                                key={sub.key}
                                className={`
                                  w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-semibold
                                  transition-all duration-150 select-none outline-none group
                                  ${isSubActive
                                    ? "bg-blue-50/90 text-blue-700 font-extrabold shadow-xs border border-blue-200/70 dark:bg-[#1d4ed8] dark:text-white dark:border-blue-500/50"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-[#0b2146] dark:hover:text-white"
                                  }
                                `}
                                onClick={() => handleTeamClick(sub.key)}
                              >
                                <div className={`p-1 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${sub.iconColor}`}>
                                  <SubIcon size={14} />
                                </div>
                                <span className="flex-1 truncate text-[12px]">{sub.name}</span>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-sky-400 shadow-[0_0_5px_rgba(37,99,235,0.6)]" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Admin Panel Section */}
          {isAdmin && (
            <div className="space-y-1 pt-4 border-t border-slate-100 dark:border-slate-800">
              {!isCollapsed && (
                <span className="px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-400 tracking-widest uppercase select-none">
                  Admin Panel
                </span>
              )}
              <div className="pt-2 space-y-1">
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold
                    transition-all duration-150 select-none outline-none group
                    ${isCollapsed ? "justify-center px-2" : ""}
                    ${activeSegment === "admin"
                      ? "bg-amber-50/80 text-[#0b2146] font-extrabold shadow-xs border border-amber-200/70 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700/50"
                      : "text-[#0b2146]/90 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-[#0b2146] dark:hover:text-white font-bold"
                    }
                  `}
                  onClick={() => {
                    setOpenMobile(false);
                    router.push("/admin/users");
                  }}
                >
                  <div className="p-1.5 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-600 bg-amber-50 border border-amber-200/60 transition-transform group-hover:scale-105">
                    <Users size={16} />
                  </div>
                  {!isCollapsed && <span className="flex-1 truncate text-[12.5px]">Manajemen User</span>}
                  {activeSegment === "admin" && (
                    <span className={`w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 shadow-[0_0_6px_rgba(217,119,6,0.6)] ${isCollapsed ? "absolute right-2" : ""}`} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area with Profile and Logout */}
        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#071733] flex flex-col gap-3 ${isCollapsed ? "items-center" : ""}`}>
          <div
            className={`flex items-center gap-3 px-2 cursor-pointer group ${isCollapsed ? "justify-center" : ""}`}
            onClick={() => router.push("/profile")}
            title="Ke Profil Saya"
          >
            <Avatar name={userName} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-[#0b2146] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{userName}</h4>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">{isAdmin ? "Administrator" : "Developer"}</p>
              </div>
            )}
          </div>
          <button
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-xs font-bold ${isCollapsed ? "justify-center" : ""}`}
            onClick={handleLogout}
          >
            <LogOut size={14} />
            {!isCollapsed && "Keluar Aplikasi"}
          </button>
        </div>
      </aside>
    </>
  );
}
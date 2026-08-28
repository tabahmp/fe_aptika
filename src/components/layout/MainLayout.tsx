"use client";

import * as React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isPrintPage?: boolean;
  hideHeader?: boolean;
  hideSidebar?: boolean;
}

export default function MainLayout({
  children,
  title,
  subtitle,
  isPrintPage = false,
  hideHeader = false,
  hideSidebar = false,
}: MainLayoutProps) {
  const [isImpersonating, setIsImpersonating] = React.useState(false);
  const [impersonatedName, setImpersonatedName] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const backupToken = localStorage.getItem("admin_token_backup");
      const userStr = localStorage.getItem("user");
      if (backupToken && userStr) {
        setIsImpersonating(true);
        try {
          const u = JSON.parse(userStr);
          setImpersonatedName(u.name || "Pengguna");
        } catch {
          setImpersonatedName("Pengguna");
        }
      } else {
        setIsImpersonating(false);
      }
    }
  }, []);

  const handleStopImpersonation = () => {
    const adminToken = localStorage.getItem("admin_token_backup");
    const adminUser = localStorage.getItem("admin_user_backup");
    if (adminToken) {
      localStorage.setItem("token", adminToken);
    }
    if (adminUser) {
      localStorage.setItem("user", adminUser);
    }
    localStorage.removeItem("admin_token_backup");
    localStorage.removeItem("admin_user_backup");
    localStorage.removeItem("impersonating_user_id");
    window.location.href = "/admin/users";
  };

  if (isPrintPage) {
    return (
      <>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-area {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              overflow: visible !important;
            }
          }
        `}</style>
        <main className="print-area min-h-screen bg-white">
          {children}
        </main>
      </>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] text-slate-800 overflow-x-hidden print:bg-white print:min-h-0 print:overflow-visible">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md relative z-50 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <span className="bg-white text-amber-700 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold shadow-xs">
              Mode Simulasi
            </span>
            <span>Anda sedang melihat sistem sebagai <strong>{impersonatedName}</strong></span>
          </div>
          <button
            onClick={handleStopImpersonation}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-3 py-1 rounded-lg text-xs font-extrabold transition-all hover:scale-105 active:scale-95"
          >
            ← Kembali ke Admin Panel
          </button>
        </div>
      )}

      {/* Diskominfo Jabar Logo Background Layer */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-center bg-no-repeat transition-all opacity-[0.35] print:hidden"
        style={{
          backgroundImage: `url('/bg-logo-diskominfo.png')`,
          backgroundSize: "min(750px, 85vw)",
        }}
      />
      {/* Soft Background Tint Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-slate-100/50 via-blue-50/30 to-slate-100/50 print:hidden" />

      {/* Main Content Layout Container */}
      <div className="relative z-10 flex min-h-screen w-full print:block print:min-h-0 print:w-full print:static">
        {/* Sidebar - only rendered if hideSidebar is false */}
        {!hideSidebar && <Sidebar />}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden print:block print:w-full print:max-h-none print:overflow-visible print:static">
          {/* Header container */}
          {!hideHeader && (
            <div className="px-6 pt-6 pb-2 flex-shrink-0 print:hidden">
              <Header title={title} subtitle={subtitle} showBrand={hideSidebar} />
            </div>
          )}

          {/* Scrollable content box */}
          <main className="flex-grow overflow-y-auto px-6 pb-6 pt-2 scrollbar-hide print:block print:overflow-visible print:p-0 print:m-0">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 print:animate-none print:transform-none print:p-0 print:m-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
export { MainLayout };

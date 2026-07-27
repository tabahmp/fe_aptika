import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ui/Toast";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "APTIKA Tools",
  description: "Rekap Data Aptika - Diskominfo Provinsi Jawa Barat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-[#f8fafc] text-slate-800" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
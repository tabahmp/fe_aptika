"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function SmkiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      title="Surat Manajemen Keamanan Informasi (SMKI)"
      subtitle="Modul pengelolaan, tata kelola kepatuhan, dan administrasi SMKI Diskominfo Jawa Barat."
    >
      {children}
    </MainLayout>
  );
}

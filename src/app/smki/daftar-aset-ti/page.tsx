"use client";

import React from "react";
import ServiceRouteGuard from "@/components/auth/ServiceRouteGuard";
import DaftarAsetTiPage from "@/app/daftar-aset-ti/page";

export default function SmkiDaftarAsetTiPage() {
  return (
    <ServiceRouteGuard requiredService="SMKI">
      <DaftarAsetTiPage />
    </ServiceRouteGuard>
  );
}

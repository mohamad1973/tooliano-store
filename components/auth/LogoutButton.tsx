"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={`rounded-lg border border-brand-gray px-3 py-1.5 text-sm text-brand-navy transition hover:border-brand-gold hover:text-brand-gold disabled:opacity-60 ${className}`}
    >
      {loading ? "…" : "تسجيل الخروج"}
    </button>
  );
}

import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="text-lg font-bold text-orange-700">
          {SITE_NAME}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700">
          <Link href="/products" className="hover:text-orange-700">
            المنتجات
          </Link>
        </nav>
      </div>
    </header>
  );
}

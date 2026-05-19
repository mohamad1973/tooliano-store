import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-6xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <p className="text-sm font-medium text-orange-700">Headless WooCommerce</p>
        <h1 className="max-w-xl text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
          مرحباً بك في {SITE_NAME}
        </h1>
        <p className="max-w-md text-zinc-600">
          الواجهة الجديدة مربوطة بمتجر WordPress على tooliano.com. ابدأ من
          صفحة المنتجات.
        </p>
        <Link
          href="/products"
          className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          عرض المنتجات
        </Link>
      </main>
    </>
  );
}

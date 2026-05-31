import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { requireBuyer } from "@/lib/auth/guards";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBuyer();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[60vh] max-w-3xl px-4 py-10">{children}</main>
      <SiteFooter />
    </>
  );
}

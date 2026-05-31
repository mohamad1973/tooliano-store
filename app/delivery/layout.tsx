import { SiteFooter } from "@/components/SiteFooter";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}

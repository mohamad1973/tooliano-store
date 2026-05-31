import { SiteFooter } from "@/components/SiteFooter";

export default function CampaignLayout({
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

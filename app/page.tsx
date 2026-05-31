import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HomePageSections } from "@/components/home/HomePageSections";
import { PageBlocksRenderer } from "@/components/home/PageBlocksRenderer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <PageBlocksRenderer />
      <HomePageSections />
      <SiteFooter />
    </>
  );
}

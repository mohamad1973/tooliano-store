import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HomePageSections } from "@/components/home/HomePageSections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <HomePageSections />
      <SiteFooter />
    </>
  );
}

import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/constants";
import { PWA_BACKGROUND_COLOR, PWA_THEME_COLOR } from "@/lib/pwa/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "أدوات المنزل العصري — Tooliano",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "ar",
    dir: "rtl",
    theme_color: PWA_THEME_COLOR,
    background_color: PWA_BACKGROUND_COLOR,
    icons: [
      {
        src: "/pwa-icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

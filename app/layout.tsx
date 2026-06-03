import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ThemeVariables } from "@/components/ThemeVariables";
import { PwaShell } from "@/components/pwa/PwaShell";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";
import { PWA_THEME_COLOR } from "@/lib/pwa/brand";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "أدوات المنزل العصري — Tooliano",
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full bg-brand-white font-sans text-brand-navy antialiased">
        <ThemeVariables />
        <PwaShell>{children}</PwaShell>
      </body>
    </html>
  );
}

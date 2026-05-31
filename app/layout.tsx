import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { ThemeVariables } from "@/components/ThemeVariables";
import "./globals.css";
import { SITE_NAME } from "@/lib/constants";

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
        {children}
      </body>
    </html>
  );
}

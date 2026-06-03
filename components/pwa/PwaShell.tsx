"use client";

import type { ReactNode } from "react";
import Script from "next/script";
import { PwaInstallProvider } from "@/components/pwa/PwaInstallProvider";
import { InstallAppPrompt } from "@/components/pwa/InstallAppPrompt";
import { InstallFab } from "@/components/pwa/InstallFab";

export function PwaShell({ children }: { children: ReactNode }) {
  return (
    <PwaInstallProvider>
      <Script id="pwa-sw-register" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js').catch(function () {});
            });
          }
        `}
      </Script>
      <InstallAppPrompt />
      <InstallFab />
      {children}
    </PwaInstallProvider>
  );
}

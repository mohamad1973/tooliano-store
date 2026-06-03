import { ImageResponse } from "next/og";
import { PWA_BRAND_GOLD, PWA_THEME_COLOR } from "@/lib/pwa/brand";

export function renderPwaIcon(size: number) {
  const fontSize = Math.round(size * 0.42);
  const radius = Math.round(size * 0.18);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: PWA_THEME_COLOR,
          borderRadius: radius,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize,
            fontWeight: 700,
            color: PWA_BRAND_GOLD,
            fontFamily: "sans-serif",
          }}
        >
          T
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}

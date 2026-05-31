import "server-only";

import axios from "axios";
import { getWpMediaCredentials } from "@/lib/wp-media-config";

export type WpMediaVerifyResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/** يتحقق من أن Application Password يعمل مع WordPress REST API */
export async function verifyWordPressMediaAuth(): Promise<WpMediaVerifyResult> {
  const creds = getWpMediaCredentials();
  if (!creds) {
    return {
      ok: false,
      message:
        "أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local ثم أعد تشغيل npm run dev",
    };
  }

  const meUrl = new URL("/wp-json/wp/v2/users/me", `${creds.baseURL}/`).toString();
  const token = Buffer.from(`${creds.user}:${creds.appPassword}`).toString(
    "base64",
  );

  try {
    const res = await axios.get(meUrl, {
      timeout: 15_000,
      headers: { Authorization: `Basic ${token}` },
      validateStatus: () => true,
    });

    if (res.status === 200) {
      return {
        ok: true,
        message: `اتصال WordPress ناجح للمستخدم «${creds.user}»`,
      };
    }

    const detail =
      typeof res.data === "object" &&
      res.data &&
      "message" in res.data &&
      typeof res.data.message === "string"
        ? res.data.message
        : `HTTP ${res.status}`;

    return {
      ok: false,
      message: `فشل التحقق من WordPress: ${detail}`,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ شبكة";
    return { ok: false, message: `تعذر الاتصال بـ ${creds.baseURL}: ${msg}` };
  }
}

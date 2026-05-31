import axios from "axios";
import { getWpMediaCredentials } from "@/lib/wp-media-config-shared";
import { uploadToWordPressMedia } from "@/lib/wp-upload-media-shared";

const TEST_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export type WpMediaFullStatus = {
  configured: boolean;
  authOk: boolean;
  canUploadMedia: boolean;
  message: string;
};

function authHeader(user: string, appPassword: string): string {
  return `Basic ${Buffer.from(`${user}:${appPassword}`).toString("base64")}`;
}

export async function getWordPressMediaFullStatus(): Promise<WpMediaFullStatus> {
  const creds = getWpMediaCredentials();
  if (!creds) {
    return {
      configured: false,
      authOk: false,
      canUploadMedia: false,
      message:
        "أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local أو Vercel — راجع docs/WORDPRESS-MEDIA-SETUP.md",
    };
  }

  const meUrl = new URL(
    "/wp-json/wp/v2/users/me",
    `${creds.baseURL}/`,
  ).toString();

  try {
    const res = await axios.get(meUrl, {
      timeout: 15_000,
      headers: { Authorization: authHeader(creds.user, creds.appPassword) },
      validateStatus: () => true,
    });

    if (res.status !== 200) {
      const detail =
        typeof res.data === "object" &&
        res.data &&
        "message" in res.data &&
        typeof res.data.message === "string"
          ? res.data.message
          : `HTTP ${res.status}`;
      return {
        configured: true,
        authOk: false,
        canUploadMedia: false,
        message: `فشل الدخول إلى WordPress: ${detail} — تأكد أن WP_MEDIA_USER هو اسم الدخول (Username) وليس كلمة مرور wp-admin`,
      };
    }

    try {
      await uploadToWordPressMedia({
        buffer: TEST_PNG,
        mimeType: "image/png",
        filename: "tooliano-connection-test.png",
      });
      return {
        configured: true,
        authOk: true,
        canUploadMedia: true,
        message: `اتصال WordPress ورفع الوسائط ناجحان للمستخدم «${creds.user}»`,
      };
    } catch (uploadErr) {
      const msg =
        uploadErr instanceof Error ? uploadErr.message : "فشل رفع تجريبي";
      return {
        configured: true,
        authOk: true,
        canUploadMedia: false,
        message: `الدخول ناجح لكن رفع الوسائط فشل: ${msg}`,
      };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ شبكة";
    return {
      configured: true,
      authOk: false,
      canUploadMedia: false,
      message: `تعذر الاتصال بـ ${creds.baseURL}: ${msg}`,
    };
  }
}

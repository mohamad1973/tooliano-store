import axios from "axios";
import {
  getWpMediaCredentials,
  isWordPressMediaUploadConfigured,
} from "@/lib/wp-media-config-shared";

const WP_MEDIA_TIMEOUT_MS = 30_000;

type WpMediaResponse = {
  source_url?: string;
  guid?: { rendered?: string };
  message?: string;
};

export { isWordPressMediaUploadConfigured };

export async function uploadToWordPressMedia(input: {
  buffer: Buffer;
  mimeType: string;
  filename: string;
}): Promise<string> {
  const creds = getWpMediaCredentials();
  if (!creds) {
    throw new Error(
      "أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local لرفع الصور إلى WordPress",
    );
  }

  const mediaUrl = new URL(
    "/wp-json/wp/v2/media",
    `${creds.baseURL}/`,
  ).toString();
  const token = Buffer.from(`${creds.user}:${creds.appPassword}`).toString(
    "base64",
  );

  const response = await axios.post<WpMediaResponse>(mediaUrl, input.buffer, {
    timeout: WP_MEDIA_TIMEOUT_MS,
    headers: {
      Authorization: `Basic ${token}`,
      "Content-Type": input.mimeType,
      "Content-Disposition": `attachment; filename="${input.filename.replace(/"/g, "")}"`,
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const detail =
      typeof response.data === "object" && response.data?.message
        ? response.data.message
        : `HTTP ${response.status}`;
    throw new Error(`فشل رفع الصورة إلى WordPress: ${detail}`);
  }

  const url =
    response.data.source_url?.trim() ||
    response.data.guid?.rendered?.trim();

  if (!url) {
    throw new Error("لم يُرجع WordPress رابطاً للصورة");
  }

  return url;
}

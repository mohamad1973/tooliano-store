import "server-only";

import {
  getWordPressMediaFullStatus,
  type WpMediaFullStatus,
} from "@/lib/wp-media-verify-shared";

export type { WpMediaFullStatus };

export type WpMediaVerifyResult =
  | { ok: true; message: string; canUploadMedia: true }
  | { ok: false; message: string; canUploadMedia: boolean };

export { getWordPressMediaFullStatus };

/** يتحقق من Application Password + إمكانية رفع وسائط */
export async function verifyWordPressMediaAuth(): Promise<WpMediaVerifyResult> {
  const full = await getWordPressMediaFullStatus();
  if (!full.configured || !full.authOk || !full.canUploadMedia) {
    return {
      ok: false,
      canUploadMedia: full.canUploadMedia,
      message: full.message,
    };
  }
  return {
    ok: true,
    canUploadMedia: true,
    message: full.message,
  };
}

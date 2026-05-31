import { revalidateTag } from "next/cache";

export const CMS_CACHE_TAG = "cms";

export function revalidateCms() {
  revalidateTag(CMS_CACHE_TAG, { expire: 0 });
}

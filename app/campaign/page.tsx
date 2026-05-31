import { redirect } from "next/navigation";
import { getCampaignConfig } from "@/lib/campaign-config";

/** توجيه /campaign إلى المنتج الافتراضي للحملة */
export default function CampaignIndexPage() {
  const { productId } = getCampaignConfig();
  redirect(`/campaign/${productId}`);
}

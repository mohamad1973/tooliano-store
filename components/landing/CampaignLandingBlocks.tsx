import { CampaignFaq } from "@/components/landing/CampaignFaq";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WalletPolicySection } from "@/components/landing/WalletPolicySection";
import {
  getFaqContent,
  getHowItWorksContent,
  getWalletPolicyContentSanitized,
} from "@/lib/cms/get-site-content";

export async function CampaignLandingBlocks() {
  const [faq, howItWorks, walletPolicy] = await Promise.all([
    getFaqContent(),
    getHowItWorksContent(),
    getWalletPolicyContentSanitized(),
  ]);

  return (
    <>
      <HowItWorks content={howItWorks} />
      <WalletPolicySection content={walletPolicy} />
      <CampaignFaq content={faq} />
    </>
  );
}

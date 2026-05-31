import { syncCampaigns } from "@/lib/campaign/sync";

async function main() {
  const result = await syncCampaigns();
  console.log("sync-campaigns:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

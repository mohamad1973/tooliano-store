import { mkdirSync, writeFileSync } from "node:fs";
import { renderPwaIcon } from "../lib/pwa/icon-image";

async function main() {
  mkdirSync("public/icons", { recursive: true });
  for (const size of [192, 512] as const) {
    const res = await renderPwaIcon(size);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(`public/icons/icon-${size}.png`, buf);
    console.log(`wrote public/icons/icon-${size}.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

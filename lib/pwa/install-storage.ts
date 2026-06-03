const STORAGE_KEY = "tooliano_pwa_prompt_v1";

export type PwaPromptChoice = "dismissed" | "installed" | "never";

export function getPwaPromptChoice(): PwaPromptChoice | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "dismissed" || v === "installed" || v === "never") return v;
  return null;
}

export function setPwaPromptChoice(choice: PwaPromptChoice) {
  localStorage.setItem(STORAGE_KEY, choice);
}

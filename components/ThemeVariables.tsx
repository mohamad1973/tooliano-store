import { getThemeColors } from "@/lib/cms/get-site-content";

export async function ThemeVariables() {
  const colors = await getThemeColors();

  const css = `:root {
  --brand-navy: ${colors.brandNavy};
  --brand-gold: ${colors.brandGold};
  --brand-gray: ${colors.brandGray};
  --brand-white: ${colors.brandWhite};
  --background: ${colors.background};
  --foreground: ${colors.foreground};
}`;

  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      data-cms-theme="true"
    />
  );
}

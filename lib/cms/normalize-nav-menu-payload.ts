import {
  extractCategorySlugFromHref,
  isWooCategoryHref,
  normalizeCategoryHref,
} from "@/lib/category-href";

type NavPayload = {
  label?: string;
  href?: string;
  linkType?: string;
  categorySlug?: string | null;
};

/** يطبّق مسار Headless الصحيح عند الحفظ من الأدمن. */
export function normalizeNavMenuPayload(body: NavPayload): NavPayload {
  const linkType = body.linkType ?? "internal";
  const slug =
    body.categorySlug?.trim() ||
    (body.href ? extractCategorySlugFromHref(body.href) : null) ||
    null;

  const isCategory =
    linkType === "category" || (body.href && isWooCategoryHref(body.href));

  if (!isCategory || !slug) {
    return {
      ...body,
      ...(body.href !== undefined ? { href: body.href.trim() } : {}),
      ...(body.categorySlug !== undefined
        ? { categorySlug: body.categorySlug?.trim() || null }
        : {}),
    };
  }

  return {
    ...body,
    linkType: "category",
    categorySlug: slug,
    href: normalizeCategoryHref(slug),
  };
}

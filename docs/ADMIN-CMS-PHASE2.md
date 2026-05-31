# مرحلة ٢ — CMS واجهة المتجر

تحرير الهيدر، الماركوي، البنرات، ترتيب الصفحة الرئيسية، الفوتر، ونصوص صفحات الحملة من لوحة الأدمن.

## مسارات الأدمن

| المسار | الوظيفة |
|--------|---------|
| `/admin/content` | فهرس أقسام المحتوى |
| `/admin/content/header` | اسم الموقع، شعار، tagline، SEO، تفعيل الماركوي |
| `/admin/content/marquee` | عبارات الشريط المتحرك |
| `/admin/content/banners` | بنرات الصفحة الرئيسية + ربط `categorySlug` |
| `/admin/content/home` | ترتيب وإظهار أقسام الصفحة الرئيسية |
| `/admin/content/footer` | أعمدة وروابط الفوتر |
| `/admin/content/campaign` | FAQ، كيف يعمل، سياسة المحفظة (JSON) |

## API (أدمن فقط)

| Method | المسار |
|--------|--------|
| GET/PUT | `/api/admin/cms/settings` |
| GET/POST | `/api/admin/cms/marquee` |
| PUT/DELETE | `/api/admin/cms/marquee/[id]` |
| GET/POST | `/api/admin/cms/banners` |
| PUT/DELETE | `/api/admin/cms/banners/[id]` |
| GET | `/api/admin/cms/sections` |
| PATCH | `/api/admin/cms/sections/[id]` |
| POST | `/api/admin/cms/sections/reorder` |
| GET/PUT | `/api/admin/cms/content/[slug]` |
| GET/PUT | `/api/admin/cms/footer` |

بعد كل تعديل: `revalidateTag('cms')` لتحديث الواجهة.

## نماذج Prisma

- `SiteSetting` — إعدادات مفتاح/قيمة
- `MarqueeItem`
- `HomeBanner`
- `HomeSection` — مفاتيح: `category_banners`, `group_buy`, `campaign_cta`
- `ContentBlock` — slugs: `faq`, `how_it_works`, `wallet_policy`
- `FooterColumn`, `FooterLink`

## القراءة في الواجهة

[`lib/cms/get-site-content.ts`](../lib/cms/get-site-content.ts) — `unstable_cache` + fallbacks من [`lib/cms/defaults.ts`](../lib/cms/defaults.ts).

## التهيئة الأولى

```bash
npm run db:push
npm run db:seed
```

الـ seed يستدعي `seedCms()` في [`prisma/seed-cms.ts`](../prisma/seed-cms.ts) لنقل المحتوى الثابت السابق إلى قاعدة البيانات.

## slugs محتوى الحملة (JSON)

- **faq:** `{ "title", "items": [{ "q", "a" }] }`
- **how_it_works:** `{ "title", "steps": [{ "title", "text" }] }`
- **wallet_policy:** `{ "title", "intro", "options": [{ "title", "text" }] }`

## ما يبقى من WooCommerce

تصنيفات الهيدر وكتالوج `/products` — بدون CMS.

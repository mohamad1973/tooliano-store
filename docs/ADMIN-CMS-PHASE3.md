# مرحلة ٣ — CMS متقدم

## الميزات الجديدة

| المسار | الوظيفة |
|--------|---------|
| `/admin/content/menu` | قائمة الهيدر (CMS فقط) — سحب وإفلات |
| `/admin/content/home` | ترتيب أقسام الرئيسية — سحب وإفلات |
| `/admin/content/pages/home` | كتل الصفحة (hero، نص غني، CTA) |
| `/admin/content/theme` | ألوان الثيم (`:root` CSS variables) |
| `/admin/content/campaign` | محرر مرئي FAQ / كيف يعمل / محفظة (TipTap للمقدمة) |

## نماذج Prisma

- `NavMenuItem` — منيو الهيدر
- `PageBlock` — كتل الصفحة الرئيسية

## المنيو

- الهيدر يقرأ من `getNavMenuItems()` فقط — **لا** WooCommerce تلقائي.
- Seed أولي: «الكل» + أول ٨ تصنيفات من Woo (مرة واحدة).

## API إضافية

- `/api/admin/cms/menu` + `[id]` + `reorder`
- `/api/admin/cms/page-blocks` + `[id]` + `reorder`
- `sections/reorder` يقبل `orderedIds[]`

## تبعيات

`@dnd-kit/*`, `@tiptap/react`, `@tiptap/starter-kit`, `sanitize-html`

## تهيئة

```bash
npm run db:push
npm run db:seed
```

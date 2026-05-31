# مرحلة ٢ — تحرير واجهة الموقع من لوحة الأدمن

المسار `/admin/content` مُجهَّز في القائمة الجانبية كعنصر «قريباً».

## المخطط

- `SiteSettings` — اسم، شعار، SEO
- `MarqueeItem` — الشريط المتحرك
- `HomeBanner` — بنرات مربوطة بتصنيف
- `ContentBlock` — FAQ، كيف يعمل، سياسة المحفظة
- `FooterColumn` / `FooterLink`
- `HomeSection` — ترتيب أقسام الصفحة الرئيسية

## ملفات ستُعدَّل

- `components/TopMarquee.tsx`, `SiteHeader.tsx`, `CategoryBanners.tsx`
- `app/page.tsx`, `app/layout.tsx`
- مكوّن `SiteFooter` جديد

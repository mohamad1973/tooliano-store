# تصنيفات WooCommerce والروابط الدائمة

المتجر Headless يعرض التصنيفات على Next.js عبر `/products?category={slug}` وليس عبر أرشيف ووردبريس. مصدر الحقيقة للـ slug هو **WooCommerce** على `tooliano.com`.

## بعد تغيير slug في ووردبريس

1. ادخل **المنتجات → التصنيفات** وعدّل الـ slug (مثل `health-and-beauty`).
2. **الإعدادات → الروابط الدائمة → حفظ** (بدون تغيير الخيار) — يعيد بناء قواعد rewrite ويقلّل 404 على `tooliano.com/product-category/...`.
3. أضف **إعادة توجيه 301** من الـ slug القديم إلى الجديد (إضافة Redirection أو Yoast):
   - من: `/product-category/الاسم-القديم/`
   - إلى: `/product-category/health-and-beauty/` (أو slug الجديد)
4. في لوحة **Tooliano Admin → المحتوى → قائمة الأقسام**: اضغط **إصلاح روابط المنيو فقط** إذا الروابط ما زالت `/product-category/...`، أو **مزامنة كاملة من Woo**.

## مسارات المتجر (Next.js)

| الرابط | السلوك |
|--------|--------|
| `/products?category=health-and-beauty` | صفحة منتجات القسم + فرص شراء جماعي مرتبطة |
| `/product-category/health-and-beauty` | إعادة توجيه تلقائية إلى `/products?category=...` |
| `/categories/health-and-beauty` | نفس إعادة التوجيه |

## اختبار بعد المزامنة

تحقق من هذه الـ slugs (أمثلة من المتجر):

- `health-and-beauty` — الصحة والجمال
- `tools` — عدد وأدوات
- `mobails` — موبايلات

افتح من المتجر:

```
/products?category=health-and-beauty
/product-category/tools
```

على ووردبريس افتح «عرض» من صفحة التصنيف وتأكد أن الرابط لا يعطي 404.

## الشراء الجماعي والتصنيف

تظهر فرص الشراء الجماعي في صفحة القسم فقط عندما يكون للحملة `wooProductId` وينتمي ذلك المنتج في WooCommerce إلى نفس التصنيف.

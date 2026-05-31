# صور المنتجات و WordPress

## التدفق الافتراضي (موصى به)

1. **التاجر أو الأدمن** يلصق **رابط صورة** (`https://...`) في نموذج المنتج — مثلاً من مكتبة وسائط tooliano.com بعد رفعها يدوياً، أو أي رابط عام.
2. يحفظ الطلب في قاعدة البيانات (`productImageUrl`).
3. **الأدمن** يوافق ثم يضغط **«نشر على WordPress»** — يُنشأ منتج WooCommerce ويُستخدم الرابط (أو تُرفع الصور المحلية القديمة عند النشر فقط).

لا حاجة لـ Application Password عند **لصق الرابط** فقط.

## رفع ملف من الجهاز (اختياري)

في النموذج: قسم مطوي **«رفع من الجهاز (اختياري)»** — يستدعي `POST /api/upload` أو مسارات التسجيل.

يتطلب على Vercel (للرفع التلقائي إلى وسائط WP):

```env
WP_URL=https://tooliano.com
WP_USERNAME=اسم_الدخول_Username
WP_APP_PASSWORD=Application_Password
```

**أسماء بديلة:** `WC_BASE_URL`، `WP_MEDIA_USER`.

## نشر WooCommerce

```env
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
```

## التحقق من رفع WP (اختياري)

```bash
npm run check:wp-media
```

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| الصورة لا تظهر | تأكد أن الرابط `https` يفتح في المتصفح |
| فشل «نشر على WordPress» | راجع مفاتيح Woo + صلاحية الرابط |
| رفع ملف اختياري يفشل | راجع `WP_USERNAME` و Application Password ثم Redeploy |

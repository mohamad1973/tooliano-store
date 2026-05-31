# إعداد رفع صور المنتج على WordPress

مسار الرفع الموحد: **`POST /api/upload`** (تاجر أو أدمن مسجّل دخول) → **وسائط WordPress** → رابط `source_url`.

## 1) إنشاء Application Password

1. ادخل [https://tooliano.com/wp-admin](https://tooliano.com/wp-admin) بحساب **مدير**.
2. **المستخدمون** → المستخدم → **الملف الشخصي**.
3. **Application Passwords** → اسم التطبيق: `Tooliano Store` → **Add New**.
4. انسخ كلمة المرور فوراً (مرة واحدة).

## 2) متغيرات البيئة

في `.env.local` محلياً وفي **Vercel → Environment Variables**:

```env
WP_URL=https://tooliano.com
WP_USERNAME=اسم_الدخول_Username
WP_APP_PASSWORD=xxxx xxxx xxxx xxxx

WC_BASE_URL=https://tooliano.com
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...
```

**أسماء بديلة مدعومة:** `WC_BASE_URL` بدل `WP_URL`، `WP_MEDIA_USER` بدل `WP_USERNAME`.

- `WP_USERNAME` = **Username** في ووردبريس (وليس البريد ولا اسم التطبيق).
- `WP_APP_PASSWORD` = Application Password فقط (ليس كلمة دخول wp-admin).
- يمكن لصق كلمة التطبيق **مع مسافات**.

## 3) التحقق

```bash
npm run check:wp-media
npm run dev
```

## 4) الاستخدام

| من | المسار |
|----|--------|
| تاجر | `/vendor` → رفع صورة → `/api/upload` |
| أدمن | `/admin/operations` → تعديل منتج → `/api/upload` |
| تسجيل تاجر | `/api/register/vendor-upload-image` (بدون جلسة) |

**نشر المنتج على WooCommerce:** زر منفصل — `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET`.

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `401` / `403` | راجع `WP_USERNAME` و Application Password |
| «غير مسموح لك بإنشاء مقالات» | حساب **Administrator** + Application Password جديد |
| فشل على Vercel فقط | Redeploy بعد تعديل المتغيرات |
| `check:wp-media` ينجح والرفع يفشل | تأكد أن النشر الأخير على Vercel محدّث |

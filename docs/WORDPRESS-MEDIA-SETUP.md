# إعداد نشر صور المنتج على WordPress

عند ظهور الرسالة:

> صورة المنتج محفوظة محلياً — أضف WP_MEDIA_USER و WP_APP_PASSWORD في .env.local

يعني أن صورة التاجر على جهاز التطوير (`public/uploads/vendors/`) ويجب رفعها إلى **tooliano.com** قبل إنشاء المنتج في WooCommerce.

## 1) إنشاء Application Password

1. ادخل [https://tooliano.com/wp-admin](https://tooliano.com/wp-admin) بحساب **مدير**.
2. **المستخدمون** → **الملف الشخصي**.
3. قسم **Application Passwords** → اسم التطبيق: `Tooliano Store` → **Add New**.
4. انسخ كلمة المرور فوراً (تظهر مرة واحدة).

## 2) تعديل `.env.local`

في جذر المشروع `d:\tooliano-store\.env.local`:

```env
WC_BASE_URL=https://tooliano.com
WC_CONSUMER_KEY=ck_...
WC_CONSUMER_SECRET=cs_...

WP_MEDIA_USER=اسم_الدخول_في_ووردبريس
WP_APP_PASSWORD=الصق Application Password هنا
```

- `WP_MEDIA_USER` = اسم الدخول (مثل `admin`) وليس البريد.
- يمكن لصق كلمة التطبيق **مع المسافات** — التطبيق يزيلها تلقائياً.

أوامر مساعدة:

```bash
npm run setup:wp-env    # يضيف قالباً في .env.local إن لم يكن موجوداً
npm run check:wp-media  # يتحقق من الاتصال بـ WordPress
```

## 3) إعادة تشغيل السيرفر

```bash
# أوقف npm run dev ثم:
npm run dev
```

## 4) النشر من لوحة الأدمن

`/admin` → منتج موافق عليه → **نشر على WordPress**.

عند النجاح: يظهر `منشور على WordPress #...` والصورة في **وسائط** WordPress.

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `401` / `403` | راجع اسم المستخدم و Application Password |
| `ملف الصورة غير موجود` | اطلب من التاجر إعادة رفع الصورة |
| `فشل رفع الصورة إلى WordPress` | تأكد أن المستخدم لديه صلاحية رفع ملفات |

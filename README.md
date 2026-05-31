# Tooliano Store

واجهة Headless لـ [tooliano.com](https://tooliano.com) — Next.js + WooCommerce REST API.

## البدء

```bash
cp env.example .env.local
# عدّل المفاتيح في .env.local

npm install
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) للصفحة الرئيسية (فارغة للتصميم) أو [http://localhost:3000/products](http://localhost:3000/products).

## Tailwind CSS

مثبت ومفعّل (v4): `tailwindcss` + `@tailwindcss/postcss` في [`app/globals.css`](app/globals.css) عبر `@import "tailwindcss"`.  
استخدم كلاسات Tailwind مباشرة في `app/` و`components/` — مثال: `className="flex gap-4 p-6 bg-brand-white rounded-xl"`.

### لوحة الألوان (Black and Gold Elegance)

| كلاس Tailwind | Hex |
|---------------|-----|
| `brand-white` | `#FFFFFF` |
| `brand-gray` | `#E5E5E5` |
| `brand-gold` | `#FCA311` |
| `brand-navy` | `#14213D` |
| `brand-black` | `#000000` |

التعريف في [`app/globals.css`](app/globals.css).

## بنرات التصنيفات (الصفحة الرئيسية)

خمس بنرات تحت المنيو — [`components/CategoryBanners.tsx`](components/CategoryBanners.tsx). المسارات في [`lib/category-banners.ts`](lib/category-banners.ts):

| الترتيب | الملف | ملاحظة |
|---------|--------|--------|
| 0 | `public/banners/tools.jpg` | أول تصنيف من WooCommerce |
| 1 | `home-kitchen.jpg` | الثاني |
| 2 | `office.jpg` | الثالث |
| 3 | `electronics.jpg` | الرابع |
| 4 | `automotive.jpg` | **البنر الخامس** |

لتغيير صورة: استبدل الملف في `public/banners/` بنفس الاسم، أو غيّر المسار في `BANNER_IMAGE_PATHS`.

## رفع صور منتجات الفيندور ونشرها على WordPress

من لوحة البائع: رفع صورة من الجهاز (JPG/PNG/WebP حتى 5 MB).

- **تطوير محلي:** تُحفظ في `public/uploads/vendors/`.
- **نشر على WordPress من الأدمن:** يتطلب `WP_MEDIA_USER` و `WP_APP_PASSWORD` في `.env.local`.

**دليل الإعداد الكامل:** [`docs/WORDPRESS-MEDIA-SETUP.md`](docs/WORDPRESS-MEDIA-SETUP.md)

```bash
npm run setup:wp-env    # قالب المفاتيح في .env.local
npm run check:wp-media  # التحقق من الاتصال بـ WordPress
```

واجهات API: `POST /api/vendor/upload-image`، `POST /api/register/vendor-upload-image`.

## النشر على Vercel + استعادة الشراء الجماعي

الشراء الجماعي والتجار يعتمدون على **قاعدة Prisma** (MySQL على Hostinger أو Postgres على Neon) — لا SQLite على Vercel.

**الدليل الموصى به (Hostinger):** [`docs/DEPLOY-HOSTINGER-MYSQL.md`](docs/DEPLOY-HOSTINGER-MYSQL.md)  
**خطوات عربية مختصرة:** [`docs/خطوات-الربط-HOSTINGER.md`](docs/خطوات-الربط-HOSTINGER.md)  
**مزامنة Vercel:** [`docs/VERCEL-ENV-SYNC.md`](docs/VERCEL-ENV-SYNC.md)  
**بديل (Neon):** [`docs/DEPLOY-VERCEL.md`](docs/DEPLOY-VERCEL.md)

```bash
# بعد Remote MySQL (%) ونسخ hostname من hPanel:
npm run setup:hostinger
```

أو يدوياً: `npm run env:sync-db-url` ثم `db:setup` و `migrate:sqlite-to-db` و `verify:db`.

## المتغيرات

| المتغير | الوصف |
|---------|--------|
| `DATABASE_URL` | MySQL (Hostinger) أو Postgres (Neon) — مطلوب على Vercel |
| `WC_BASE_URL` | أصل WordPress (مثل `https://tooliano.com`) |
| `WC_CONSUMER_KEY` | مفتاح REST API |
| `WC_CONSUMER_SECRET` | سر REST API |
| `WP_MEDIA_USER` | (اختياري) مستخدم WP لرفع الصور |
| `WP_APP_PASSWORD` | (اختياري) Application Password لنفس المستخدم |

**لا ترفع `.env.local` على Git.**

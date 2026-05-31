# نشر Tooliano Store على Vercel مع Neon Postgres

> **لديك استضافة Hostinger؟** استخدم [`DEPLOY-HOSTINGER-MYSQL.md`](DEPLOY-HOSTINGER-MYSQL.md) بدلاً من Neon.

منتجات المتجر تأتي من **WooCommerce** على tooliano.com.  
**الشراء الجماعي** والتجار والأدمن يعتمدون على **قاعدة Prisma** — لا SQLite على Vercel (استخدم Postgres هنا أو MySQL على Hostinger).

---

## 1) إنشاء قاعدة Neon

1. [neon.tech](https://neon.tech) → مشروع جديد (مثلاً `tooliano-store-prod`).
2. انسخ **Connection string** (PostgreSQL) — يبدأ بـ `postgresql://...`
3. أضف `?sslmode=require` إن لم يكن موجوداً.

**اختياري للتطوير المحلي:** فرع (branch) منفصل `dev` واستخدمه في `.env.local` المحلي.

---

## 2) متغيرات Vercel

**Settings → Environment Variables** — فعّل **Production** و **Preview**:

| المتغير | مثال / ملاحظة |
|---------|----------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | سلسلة عشوائية 32+ حرفاً (ثابتة بين النشرات) |
| `WC_BASE_URL` | `https://tooliano.com` |
| `WC_CONSUMER_KEY` | من WooCommerce → REST API |
| `WC_CONSUMER_SECRET` | نفس المصدر |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |
| `ADMIN_USERNAME` | حساب الأدمن |
| `ADMIN_PASSWORD` | كلمة مرور الأدمن |
| `WP_MEDIA_USER` | مستخدم WP (بريد أو اسم مستخدم) |
| `WP_APP_PASSWORD` | Application Password بدون مسافات |

باقي المتغيرات من [`env.example`](../env.example).

بعد أي تغيير: **Deployments → Redeploy**.

**Build على Vercel:** في Project Settings → Build Command استخدم:

```bash
npm run vercel-build
```

(يشغّل `prisma db push` ثم `next build` — أو نفّذ `npm run db:setup` يدوياً مرة واحدة قبل أول نشر.)

---

## 3) تهيئة الجداول على Neon (مرة واحدة)

على جهازك، في `.env.local`:

```env
DATABASE_URL="postgresql://..."
```

ثم:

```bash
npm run db:setup
npm run db:seed
```

---

## 4) ترحيل البيانات من SQLite المحلي

### إيجاد قاعدة المحلي

```powershell
Get-Item D:\tooliano-store\prisma\dev.db
Get-ChildItem D:\tooliano-store -Recurse -Filter "*.db"
```

انسخ الملف احتياطياً قبل الترحيل.

### الترحيل

في `.env.local`:

- `DATABASE_URL` = رابط **Neon**
- (اختياري) `SQLITE_PATH=./prisma/dev.db`

```bash
npm run migrate:sqlite-to-neon
```

إن وُجدت القاعدة في `prisma/prisma/dev.db` (مسار متداخل)، السكربت يكتشفها تلقائياً أو استخدم:

```env
SQLITE_PATH=./prisma/prisma/dev.db
```

بعد الترحيل، إن كانت الحملات منتهية يُمدّدها السكربت تلقائياً (7 أيام). لتعطيل ذلك: `EXTEND_EXPIRED_CAMPAIGNS=false`. يدوياً: `npm run extend:campaigns`.

### رفع صور الفيندور

على **Vercel** ضبط `WP_MEDIA_USER` (Username) و `WP_APP_PASSWORD` (Application Password فقط). الرفع من النموذج → وسائط WordPress؛ نشر المنتج → WooCommerce. تحقق: `npm run check:wp-media` ثم Redeploy.

لترحيل صور قديمة محلية (`/uploads/vendors/`):

```bash
npm run migrate:vendor-images
```

---

## 5) التحقق بعد النشر

```bash
npm run verify:neon-db
```

أو يدوياً:

| المسار | المتوقع |
|--------|---------|
| `/` | قسم «فرص الشراء الجماعي» |
| `/admin` | طلبات التجار والمنتجات |
| `/vendor` | لوحة التاجر |
| `/campaign/offer/[id]` | تفاصيل حملة |

---

## استكشاف الأخطاء

| العرض | السبب المحتمل |
|-------|----------------|
| منتجات Woo تظهر، الشراء الجماعي فارغ | `DATABASE_URL` لا يشير لـ Neon أو DB فارغة |
| «لا توجد فرص نشطة» | لا سجلات `APPROVED` + `publishedOnStore` + `campaignEndsAt` مستقبلي |
| صور مكسورة | شغّل `migrate:vendor-images` أو انشر المنتج من الأدمن على Woo |
| خطأ 500 على `/admin` | `prisma db push` لم يُنفَّذ على Neon |

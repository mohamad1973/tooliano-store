# MySQL على Hostinger + الشراء الجماعي على Vercel

Next.js على **Vercel** — قاعدة **Prisma** (تجار، شراء جماعي، أدمن) على **MySQL Hostinger**.  
منتجات المتجر من **WooCommerce** على tooliano.com (`WC_*`).

---

## 1) إنشاء قاعدة MySQL في hPanel

1. **hPanel** → **Databases** → **MySQL Databases**
2. **Create database** — مثلاً `u123456789_tooliano`
3. **Create user** — كلمة مرور قوية
4. **Add user to database** — **All Privileges**
5. سجّلي:
   - Database name
   - Username
   - Password
   - **Hostname** (للاتصال الخارجي — غالباً `srvXXXX.hstgr.io` وليس `localhost`)
   - Port: `3306`

---

## 2) Remote MySQL (إلزامي لـ Vercel)

**hPanel** → **Remote MySQL** → أضيفي مضيف وصول:

- `%` — يسمح من أي IP (مناسب لـ Vercel؛ مستخدم DB مخصص للتطبيق فقط)

لا تستخدمي مستخدم/قاعدة WordPress — أنشئي قاعدة **منفصلة** للمتجر Headless.

---

## 3) DATABASE_URL

قالب: [`env.hostinger.example`](../env.hostinger.example)  
دليل عربي مختصر: [`خطوات-الربط-HOSTINGER.md`](خطوات-الربط-HOSTINGER.md)

**أسهل طريقة (تفاعلي):**

```bash
npm run setup:hostinger
```

**أو يدوياً** — املأ `MYSQL_*` في `.env.local` ثم:

```bash
npm run env:sync-db-url
```

في `.env.local` و **Vercel → Environment Variables** (Production + Preview):

```env
DATABASE_URL="mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME?connection_limit=5"
```

- رموز خاصة في كلمة المرور → [URL encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding)
- لا تستخدمي `file:./prisma/dev.db` على Vercel

---

## 4) تهيئة الجداول (مرة واحدة)

```bash
npm run db:setup
npm run db:seed
```

---

## 5) ترحيل بيانات localhost (SQLite)

```bash
npm run locate:dev-db
npm run migrate:sqlite-to-db
npm run migrate:vendor-images
npm run extend:campaigns
npm run verify:db
```

---

## 6) Vercel

| المتغير | ملاحظة |
|---------|--------|
| `DATABASE_URL` | رابط MySQL Hostinger |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |
| `WC_*`, `JWT_SECRET`, `ADMIN_*`, `WP_MEDIA_*` | كما في `env.example` |

**Build Command:** `npm run vercel-build`

بعد تغيير المتغيرات: **Redeploy**.

---

## 7) التحقق

| المسار | المتوقع |
|--------|---------|
| `/` | فرص الشراء الجماعي |
| `/admin` | طلبات التجار والمنتجات |
| `/vendor` | لوحة التاجر |
| `/campaign/offer/[id]` | تفاصيل حملة |

```bash
npm run verify:db
```

---

## استكشاف الأخطاء

| الخطأ | الحل |
|-------|------|
| Woo يعمل، الشراء الجماعي فارغ | ترحيل SQLite + `extend:campaigns` |
| `Can't reach database server` | Remote MySQL + hostname صحيح |
| `Access denied` | مستخدم/كلمة مرور/صلاحيات القاعدة |
| صور مكسورة | `npm run migrate:vendor-images` |

بديل سحابي: [`docs/DEPLOY-VERCEL.md`](DEPLOY-VERCEL.md) (Neon Postgres).

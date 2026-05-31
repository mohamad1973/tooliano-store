# خطوات ربط MySQL (Hostinger) — Tooliano Store

## قبل البدء في hPanel

1. **MySQL Databases** — تأكد أن القاعدة `u419683418_tooliano` والمستخدم `u419683418_mohamad` مُنشآن.
2. انسخ **MySQL hostname** من نفس الصفحة (ليس `localhost` ولا `127.0.0.1`).
3. **Remote MySQL** → Host: `%` → Database: `u419683418_tooliano` → **Create**.
4. في أعلى صفحة Remote MySQL يظهر **hostname للاتصال الخارجي** — استخدمه في `MYSQL_HOST`.

## على اللابتوب (أمر واحد تفاعلي)

```powershell
cd D:\tooliano-store
npm run setup:hostinger
```

سيسألك عن Hostname وكلمة المرور ثم يشغّل: `db:setup`, `db:seed`, الترحيل, والتحقق.

## بدون الوضع التفاعلي

املأ في `.env.local`:

```env
MYSQL_HOST=srvXXXX.hstgr.io
MYSQL_PORT=3306
MYSQL_USER=u419683418_mohamad
MYSQL_DATABASE=u419683418_tooliano
MYSQL_PASSWORD=كلمة_المرور
```

ثم:

```powershell
npm run env:sync-db-url
npm run db:setup
npm run db:seed
npm run migrate:sqlite-to-db
npm run migrate:vendor-images
npm run extend:campaigns
npm run verify:db
```

## Vercel

1. **Settings → Environment Variables** — انسخ `DATABASE_URL` من `.env.local` (Production + Preview).
2. **Build Command:** `npm run vercel-build`
3. **Redeploy**

## التحقق

- `npm run verify:db` — فرص شراء جماعي نشطة > 0
- افتح رابط Vercel → `/` → قسم فرص الشراء الجماعي

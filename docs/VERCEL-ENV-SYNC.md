# متغيرات Vercel — قائمة نسخ من .env.local

بعد `npm run verify:db` بنجاح، انسخ **كل** المتغيرات التالية إلى  
**Vercel → Project → Settings → Environment Variables**

فعّل **Production** و **Preview** لكل متغير.

| Key | ملاحظة |
|-----|--------|
| `DATABASE_URL` | رابط MySQL Hostinger |
| `JWT_SECRET` | 32+ حرف — لا تغيّره بعد النشر |
| `WC_BASE_URL` | `https://tooliano.com` |
| `WC_CONSUMER_KEY` | من WooCommerce REST API |
| `WC_CONSUMER_SECRET` | من WooCommerce REST API |
| `NEXT_PUBLIC_SITE_URL` | **`https://tooliano-store.vercel.app`** (ليس localhost) |
| `NEXT_PUBLIC_SITE_NAME` | Tooliano |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | EGP |
| `NEXT_PUBLIC_CURRENCY_LOCALE` | ar-EG |
| `NEXT_PUBLIC_WP_STORE_ORIGIN` | `https://tooliano.com` |
| `ADMIN_USERNAME` | admin |
| `ADMIN_PASSWORD` | كلمة مرور الأدمن |
| `WP_MEDIA_USER` | مستخدم WordPress |
| `WP_APP_PASSWORD` | Application Password |

قالب: [`env.vercel.example`](../env.vercel.example)

## Build

[`vercel.json`](../vercel.json) يضبط:

```json
{ "buildCommand": "npm run vercel-build" }
```

## بعد الإضافة

1. **Deployments → Redeploy**
2. افتح `https://tooliano-store.vercel.app`
3. `/` → فرص الشراء الجماعي (6 متوقعة)
4. `/admin` → دخول الأدmin

## تحقق محلي

```bash
npm run verify:db
npm run vercel-build
npm run dev
```

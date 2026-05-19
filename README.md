# Tooliano Store

واجهة Headless لـ [tooliano.com](https://tooliano.com) — Next.js + WooCommerce REST API.

## البدء

```bash
cp env.example .env.local
# عدّل المفاتيح في .env.local

npm install
npm run dev
```

افتح [http://localhost:3000/products](http://localhost:3000/products).

## المتغيرات

| المتغير | الوصف |
|---------|--------|
| `WC_BASE_URL` | أصل WordPress (مثل `https://tooliano.com`) |
| `WC_CONSUMER_KEY` | مفتاح REST API |
| `WC_CONSUMER_SECRET` | سر REST API |

**لا ترفع `.env.local` على Git.**

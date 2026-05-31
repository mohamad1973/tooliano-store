# محفظة العميل والتسليم الآمن

## نظرة عامة

- المشتري يدفع **5%** مقدماً عبر Paymob (أو محاكاة في التطوير).
- بعد Webhook ناجح: **إيداع** في المحفظة ثم **قفل** على الطلب.
- نجاح الحملة: الطلب `READY_FOR_DELIVERY` + **كود 6 أرقام** للمشتري فقط.
- المندوب يؤكد الكود → `DELIVERED` + **تسوية 5%** لحساب المنصة.
- العميل يدفع **95%** نقداً للمندوب عند الاستلام.
- فشل الحملة: **تحرير** المقدم إلى الرصيد المتاح.

## الأدوار

| الدور | المسارات |
|--------|----------|
| `BUYER` | `/account`, `/account/wallet`, `/account/orders/[id]` |
| `DELIVERY_AGENT` | `/delivery` |
| `ADMIN` | `/admin/delivery` |
| `VENDOR` | لا وصول لمحفظة العميل — يرى كميات وحالات فقط |

## متغيرات البيئة

```env
DEPOSIT_PERCENT=5
DELIVERY_CODE_TTL_DAYS=7
DELIVERY_CODE_MAX_ATTEMPTS=10
DELIVERY_CODE_PEPPER=  # اختياري — يستخدم JWT_SECRET إن لم يُحدَّد

PAYMOB_API_KEY=
PAYMOB_INTEGRATION_ID=
PAYMOB_HMAC_SECRET=
PAYMOB_IFRAME_ID=
PAYMOB_ALLOW_DEV_SIMULATE=true  # تطوير فقط
```

## أوامر

```bash
npm run db:setup
npm run db:seed
npm run jobs:sync-campaigns
```

## Webhook Paymob

`POST /api/payments/paymob/webhook` — يتحقق من HMAC ويستدعي `confirmOrderPayment` مع `idempotencyKey`.

## Cron

جدولة `npm run jobs:sync-campaigns` يومياً (Vercel Cron أو Hostinger) لفحص الحملات المنتهية.

## الأمان

- لا يُعتمد الدفع من المتصفح فقط — الرصيد يزيد بعد Webhook أو محاكاة التطوير.
- كود التسليم: hash في `DeliveryConfirmation`، العرض من `DeliveryCodeReveal` للمشتري فقط.
- 10 محاولات خاطئة → قفل الطلب (`lockedAt`).

## المرحلة التالية (خارج النطاق)

- صرف أرباح التاجر
- SMS للكود
- استرداد نقدي تلقائي

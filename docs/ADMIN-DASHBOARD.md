# لوحة الإدارة الشاملة

## المسارات

| المسار | الوظيفة |
|--------|---------|
| `/admin` | ملخص KPIs |
| `/admin/users` | المستخدمون (تبويبات حسب الدور) |
| `/admin/users/buyers/[id]` | تفاصيل مشتري + إعادة تعيين كلمة المرور |
| `/admin/users/vendors/[id]` | تفاصيل تاجر |
| `/admin/users/delivery-agents/[id]` | تفاصيل مندوب |
| `/admin/payments` | محافظ + تحصيل + أرباح |
| `/admin/payments/wallets/[userId]` | سجل محفظة كامل |
| `/admin/operations` | موافقة تجار ومنتجات |
| `/admin/delivery` | مندوبون وطلبات |
| `/admin/content` | مرحلة ٢ (placeholder) |

## الدفع المرن

- حد أدنى **5%** من `lineTotal` للدفعة الأولى
- يمكن الدفع حتى **100%** قبل أو بعد نجاح الحملة
- `remainingBalance = lineTotal - paidOnlineTotal`
- جدول `OrderPayment` لكل دفعة

## API

- `GET /api/admin/users?role=BUYER`
- `POST /api/admin/users/[id]/reset-password`

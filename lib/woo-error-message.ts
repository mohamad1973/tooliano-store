import axios from "axios";

export function formatWooCommerceError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as
      | { message?: string; code?: string }
      | string
      | undefined;

    if (typeof data === "object" && data?.message) {
      return data.message;
    }
    if (typeof data === "string" && data.trim()) {
      return data.slice(0, 300);
    }

    const status = e.response?.status;
    if (status === 400) {
      return "رفض WordPress الطلب (400) — تحقق من الصورة والأسعار وبيانات المنتج";
    }
    if (status === 401 || status === 403) {
      return "صلاحيات WooCommerce غير كافية — تحقق من مفاتيح API";
    }

    return e.message;
  }

  if (e instanceof Error) return e.message;
  return "فشل الاتصال بـ WordPress";
}

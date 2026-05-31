import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "إنشاء حساب",
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <AuthCard
          title="إنشاء حساب جديد"
          subtitle="اختر نوع الحساب: مشتري للشراء من المتجر، أو تاجر لعرض منتجاتك عبر الشراء الجماعي."
          backHref="/login"
          backLabel="لديك حساب؟ تسجيل الدخول"
        >
          <div className="grid gap-4">
            <Link
              href="/register/buyer"
              className="block rounded-xl border-2 border-brand-gray p-5 transition hover:border-brand-gold hover:bg-brand-gold/5"
            >
              <span className="text-lg font-bold text-brand-navy">مشتري</span>
              <p className="mt-2 text-sm text-brand-navy/70">
                للمشاركة في حملات الشراء الجماعي والتسوق من Tooliano.
              </p>
            </Link>
            <Link
              href="/register/vendor"
              className="block rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-5 transition hover:bg-brand-gold/20"
            >
              <span className="text-lg font-bold text-brand-navy">تاجر / مورد</span>
              <p className="mt-2 text-sm text-brand-navy/70">
                تسجيل شركة، بيانات التواصل، وإرسال منتجاتك لمراجعة الإدارة والموافقة.
              </p>
            </Link>
          </div>
        </AuthCard>
      </main>
    </>
  );
}

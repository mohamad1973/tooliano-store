import { AuthCard } from "@/components/auth/AuthCard";
import { BuyerRegisterForm } from "@/components/auth/BuyerRegisterForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "تسجيل مشتري",
};

export default function BuyerRegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <AuthCard
          title="حساب مشتري"
          subtitle="أنشئ حساباً للمشاركة في عروض الشراء الجماعي."
          backHref="/register"
        >
          <BuyerRegisterForm />
        </AuthCard>
      </main>
    </>
  );
}

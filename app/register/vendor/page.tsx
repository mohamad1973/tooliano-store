import { AuthCard } from "@/components/auth/AuthCard";
import { VendorRegisterForm } from "@/components/auth/VendorRegisterForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "تسجيل تاجر",
};

export default function VendorRegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <AuthCard
          className="max-w-3xl"
          title="تسجيل تاجر / مورد"
          subtitle="أدخل بيانات الشركة ومنتجك الأول. ستصل طلباتك إلى الإدارة للموافقة أو الرفض."
          backHref="/register"
        >
          <VendorRegisterForm />
        </AuthCard>
      </main>
    </>
  );
}

import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "تسجيل الدخول",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <AuthCard
          title="تسجيل الدخول"
          subtitle="مشتري، تاجر، أو مدير النظام."
          backHref="/"
          backLabel="الرئيسية"
        >
          <LoginForm />
        </AuthCard>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Agent = { id: string; username: string; phone: string | null };

export function AdminDeliveryAgents({
  initialAgents,
}: {
  initialAgents: Agent[];
}) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delivery-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "فشل الإنشاء");
        return;
      }
      setAgents((prev) => [data.agent, ...prev]);
      setUsername("");
      setPassword("");
      router.refresh();
    } catch {
      setError("تعذر الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-brand-navy">مندوبو التسليم</h2>
      <ul className="mb-4 space-y-1 text-sm">
        {agents.map((a) => (
          <li key={a.id} className="text-brand-navy/80">
            @{a.username}
            {a.phone ? ` · ${a.phone}` : ""}
          </li>
        ))}
        {agents.length === 0 ? (
          <li className="text-brand-navy/50">لا يوجد مندوبون.</li>
        ) : null}
      </ul>
      <form onSubmit={createAgent} className="flex flex-col gap-2 max-w-sm">
        <input
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-brand-gray px-3 py-2 text-sm"
          required
          minLength={6}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-gold py-2 text-sm font-bold text-brand-navy disabled:opacity-60"
        >
          إضافة مندوب
        </button>
      </form>
    </section>
  );
}

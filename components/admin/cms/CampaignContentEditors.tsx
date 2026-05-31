"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AdminCmsMessage } from "@/components/admin/cms/AdminCmsMessage";
import { FaqEditor } from "@/components/admin/cms/FaqEditor";
import { RichTextEditor } from "@/components/admin/cms/RichTextEditor";
import { CONTENT_BLOCK_SLUGS } from "@/lib/cms/defaults";
import type {
  FaqContent,
  HowItWorksContent,
  WalletPolicyContent,
} from "@/lib/cms/types";

function HowItWorksEditor({ initial }: { initial: HowItWorksContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [steps, setSteps] = useState(initial.steps);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = JSON.stringify({ title, steps });
    const res = await fetch(
      `/api/admin/cms/content/${CONTENT_BLOCK_SLUGS.HOW_IT_WORKS}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      },
    );
    if (!res.ok) {
      setError("فشل الحفظ");
      return;
    }
    setMessage("تم الحفظ");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 max-w-2xl border-b border-brand-gray pb-10">
      <h3 className="mb-3 text-lg font-bold text-brand-navy">كيف يعمل</h3>
      <AdminCmsMessage message={message} error={error} />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-lg border px-3 py-2"
        placeholder="العنوان"
      />
      {steps.map((step, i) => (
        <div key={i} className="mb-3 rounded-xl border p-3">
          <input
            value={step.title}
            onChange={(e) =>
              setSteps((s) =>
                s.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
              )
            }
            className="mb-2 w-full rounded border px-2 py-1 text-sm font-bold"
            placeholder="عنوان الخطوة"
          />
          <textarea
            value={step.text}
            onChange={(e) =>
              setSteps((s) =>
                s.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)),
              )
            }
            className="w-full rounded border px-2 py-1 text-sm"
            rows={2}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-brand-gold"
        onClick={() =>
          setSteps((s) => [...s, { title: "خطوة جديدة", text: "" }])
        }
      >
        + خطوة
      </button>
      <button
        type="submit"
        className="mt-4 block rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy"
      >
        حفظ
      </button>
    </form>
  );
}

function WalletPolicyEditor({ initial }: { initial: WalletPolicyContent }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [introHtml, setIntroHtml] = useState(initial.intro);
  const [options, setOptions] = useState(initial.options);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const body = JSON.stringify({ title, intro: introHtml, options });
    const res = await fetch(
      `/api/admin/cms/content/${CONTENT_BLOCK_SLUGS.WALLET_POLICY}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      },
    );
    if (!res.ok) {
      setError("فشل الحفظ");
      return;
    }
    setMessage("تم الحفظ");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mb-10 max-w-2xl">
      <h3 className="mb-3 text-lg font-bold text-brand-navy">سياسة المحفظة</h3>
      <AdminCmsMessage message={message} error={error} />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-4 w-full rounded-lg border px-3 py-2"
      />
      <p className="mb-2 text-sm font-medium">المقدمة (نص غني)</p>
      <RichTextEditor content={introHtml} onChange={setIntroHtml} />
      <p className="mb-2 mt-6 text-sm font-medium">الخيارات</p>
      {options.map((o, i) => (
        <div key={i} className="mb-3 rounded-xl border p-3">
          <input
            value={o.title}
            onChange={(e) =>
              setOptions((opts) =>
                opts.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
              )
            }
            className="mb-2 w-full rounded border px-2 py-1 text-sm font-bold"
          />
          <textarea
            value={o.text}
            onChange={(e) =>
              setOptions((opts) =>
                opts.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)),
              )
            }
            className="w-full rounded border px-2 py-1 text-sm"
            rows={2}
          />
        </div>
      ))}
      <button
        type="submit"
        className="mt-4 block rounded-xl bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy"
      >
        حفظ سياسة المحفظة
      </button>
    </form>
  );
}

export function CampaignContentEditors({
  faq,
  howItWorks,
  walletPolicy,
}: {
  faq: FaqContent;
  howItWorks: HowItWorksContent;
  walletPolicy: WalletPolicyContent;
}) {
  return (
    <>
      <FaqEditor slug={CONTENT_BLOCK_SLUGS.FAQ} initial={faq} />
      <HowItWorksEditor initial={howItWorks} />
      <WalletPolicyEditor initial={walletPolicy} />
    </>
  );
}

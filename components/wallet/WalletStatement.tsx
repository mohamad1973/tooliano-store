import Link from "next/link";
import type { WalletStatementLine } from "@/lib/wallet/statement";
import { formatCurrency } from "@/lib/format";

function formatWhen(date: Date) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function WalletStatement({
  lines,
  showPrivacyNote = true,
}: {
  lines: WalletStatementLine[];
  showPrivacyNote?: boolean;
}) {
  if (lines.length === 0) {
    return (
      <p className="text-sm text-brand-navy/60">لا توجد معاملات بعد.</p>
    );
  }

  return (
    <div className="space-y-4">
      {showPrivacyNote ? (
        <p className="rounded-lg bg-brand-gray/30 px-3 py-2 text-xs text-brand-navy/70">
          هذا الكشف يخص حسابك فقط — لا يظهر لأي مشتري آخر.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-brand-gray bg-brand-white">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b bg-brand-gray/30 text-brand-navy/70">
              <th className="p-3 text-right font-semibold">التاريخ</th>
              <th className="p-3 text-right font-semibold">البيان</th>
              <th className="p-3 text-right font-semibold">المبلغ</th>
              <th className="p-3 text-right font-semibold">مدفوع على الطلب</th>
              <th className="p-3 text-right font-semibold">الباقي</th>
              <th className="p-3 text-right font-semibold">طلب</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr
                key={line.id}
                className="border-b border-brand-gray/50 align-top"
              >
                <td className="whitespace-nowrap p-3 text-xs text-brand-navy/60">
                  {formatWhen(line.date)}
                </td>
                <td className="p-3">
                  <p className="font-semibold text-brand-navy">{line.title}</p>
                  <p className="mt-0.5 text-xs text-brand-navy/70">
                    «{line.productName}»
                  </p>
                </td>
                <td className="whitespace-nowrap p-3 font-bold text-brand-gold">
                  {formatCurrency(line.amountPaid)}
                </td>
                <td className="whitespace-nowrap p-3 text-brand-navy">
                  {line.paidOnOrder != null
                    ? formatCurrency(line.paidOnOrder)
                    : "—"}
                </td>
                <td className="whitespace-nowrap p-3 text-brand-navy">
                  {line.remainingOnOrder != null
                    ? formatCurrency(line.remainingOnOrder)
                    : "—"}
                </td>
                <td className="p-3">
                  {line.orderId ? (
                    <Link
                      href={`/account/orders/${line.orderId}`}
                      className="text-xs font-semibold text-brand-gold hover:underline"
                    >
                      عرض
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

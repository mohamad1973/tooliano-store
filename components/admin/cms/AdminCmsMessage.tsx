"use client";

export function AdminCmsMessage({
  message,
  error,
  saving,
}: {
  message?: string | null;
  error?: string | null;
  saving?: boolean;
}) {
  if (saving) {
    return (
      <p
        className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
        role="status"
      >
        جاري الحفظ…
      </p>
    );
  }
  if (!message && !error) return null;
  return (
    <p
      className={`mb-4 rounded-lg px-3 py-2 text-sm ${
        error
          ? "bg-red-50 text-red-800"
          : "bg-green-50 text-green-800"
      }`}
      role="status"
    >
      {error ?? message}
    </p>
  );
}

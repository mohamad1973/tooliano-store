"use client";

export function AdminCmsMessage({
  message,
  error,
}: {
  message?: string | null;
  error?: string | null;
}) {
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

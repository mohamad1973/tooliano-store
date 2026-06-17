"use client";

export function HeaderSearchDropdown() {
  return (
    <div className="group/search relative" dir="rtl">
      <button
        type="button"
        aria-label="بحث"
        className="flex h-8 w-8 items-center justify-center rounded-full text-brand-gold transition hover:bg-brand-gold/20 hover:text-brand-gold sm:h-9 sm:w-9"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      <div className="invisible absolute end-0 top-full z-[120] mt-2 w-[min(100vw-2rem,20rem)] translate-y-1 opacity-0 transition duration-150 group-hover/search:visible group-hover/search:translate-y-0 group-hover/search:opacity-100 group-focus-within/search:visible group-focus-within/search:translate-y-0 group-focus-within/search:opacity-100">
        <form
          action="/products"
          method="get"
          className="rounded-2xl border border-brand-gold/40 bg-brand-white p-3 shadow-xl"
        >
          <label className="mb-2 block text-xs font-semibold text-brand-navy">
            ابحث عن منتج أو أي كلمة في الموقع
          </label>
          <div className="flex items-center gap-2">
            <input
              type="search"
              name="search"
              placeholder="اكتب كلمة البحث..."
              className="min-w-0 flex-1 rounded-xl border border-brand-gray px-3 py-2 text-sm text-brand-navy outline-none transition focus:border-brand-gold"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-brand-navy transition hover:bg-brand-gold/90"
              aria-label="تنفيذ البحث"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-brand-gray bg-brand-white px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30";

type BaseProps = {
  label: string;
  name: string;
  required?: boolean;
  hint?: ReactNode;
};

export function AuthTextField({
  label,
  name,
  required,
  hint,
  ...props
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-brand-navy">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      <input name={name} required={required} className={fieldClass} {...props} />
      {hint ? <span className="mt-1 block text-xs text-brand-navy/60">{hint}</span> : null}
    </label>
  );
}

export function AuthTextArea({
  label,
  name,
  required,
  hint,
  rows = 4,
  ...props
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm font-medium text-brand-navy">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      <textarea
        name={name}
        required={required}
        rows={rows}
        className={fieldClass}
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-brand-navy/60">{hint}</span> : null}
    </label>
  );
}

export function AuthSelect({
  label,
  name,
  required,
  hint,
  children,
  ...props
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-brand-navy">
      {label}
      {required ? <span className="text-red-600"> *</span> : null}
      <select name={name} required={required} className={fieldClass} {...props}>
        {children}
      </select>
      {hint ? <span className="mt-1 block text-xs text-brand-navy/60">{hint}</span> : null}
    </label>
  );
}

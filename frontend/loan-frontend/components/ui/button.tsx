import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

function merge(...items: Array<string | undefined | false>) {
  return items.filter(Boolean).join(" ");
}

const base =
  "text-button inline-flex items-center justify-center rounded-lg px-4 py-2.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
  secondary:
    "border border-[var(--border)] bg-[var(--secondary)] text-white hover:opacity-90",
};

export function Button({
  children,
  className,
  variant = "primary",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  variant?: Variant;
}) {
  return (
    <button className={merge(base, variants[variant], className)} style={{ color: "#ffffff", ...style }} {...props}>
      {children}
    </button>
  );
}

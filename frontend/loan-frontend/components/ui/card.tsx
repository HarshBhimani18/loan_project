import type { ReactNode } from "react";

function merge(...items: Array<string | undefined>) {
  return items.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={merge("app-card", className)}>{children}</section>;
}


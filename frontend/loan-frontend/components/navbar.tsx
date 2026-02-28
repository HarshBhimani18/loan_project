"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/predict", label: "Predict Risk" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/92 backdrop-blur-md supports-[backdrop-filter]:bg-white/78">
      <div className="mx-auto grid h-[4.25rem] w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group inline-flex items-center text-[var(--foreground)]">
          <span className="font-brand text-lg font-bold tracking-tight transition-colors group-hover:text-[var(--primary)]">
            Loan Default
          </span>
        </Link>

        <nav className="col-start-2 flex items-center justify-center gap-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-button relative pb-1 font-semibold tracking-tight transition-colors duration-200 ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left rounded-full bg-[var(--primary)] transition-transform duration-200 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

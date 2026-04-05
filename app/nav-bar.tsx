"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",     label: "Home" },
  { href: "/new",  label: "Add Workout" },
  { href: "/week", label: "Week" },
];

export function NavBar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm shadow-slate-100">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 hover:text-sky-600 transition-colors"
        >
          <span className="text-lg">💪</span>
          <span>Workout Tracker</span>
        </Link>

        {/* Links */}
        <ul className="flex items-center gap-0.5">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                    active
                      ? "text-sky-600 bg-sky-50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {label}
                  {/* Active underline indicator */}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-sky-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

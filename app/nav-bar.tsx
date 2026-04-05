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
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-white hover:text-zinc-300 transition-colors"
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
                      ? "text-white bg-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
                >
                  {label}
                  {/* Active dot indicator */}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full bg-white/60" />
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

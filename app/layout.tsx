import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workout Tracker",
  description: "Track your personal workouts",
};

const navLinks = [
  { href: "/",     label: "Home" },
  { href: "/new",  label: "Add Workout" },
  { href: "/week", label: "Week" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        {/* Navigation bar */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link
              href="/"
              className="text-base font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors"
            >
              💪 Workout Tracker
            </Link>
            <ul className="flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
          <Providers>{children}</Providers>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
          Workout Tracker — keep showing up.
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "./nav-bar";
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
        <NavBar />

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
          <Providers>{children}</Providers>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 py-5 text-center text-xs text-zinc-700 tracking-wide">
          Keep showing up. 💪
        </footer>
      </body>
    </html>
  );
}

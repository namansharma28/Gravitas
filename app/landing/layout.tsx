"use client";

import { ModeToggle } from '@/components/layout/mode-toggle';
import LandingNavbar from '@/components/layout/landing-navbar';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden ">
      <LandingNavbar />
      <main className="min-h-screen flex flex-col items-center justify-center pt-1">
        {children}
      </main>
      <footer className="py-8 text-center text-sm text-white/80">
        © {new Date().getFullYear()} Gravitas. All rights reserved.
      </footer>
    </div>
  );
}
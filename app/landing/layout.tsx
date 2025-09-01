"use client";

import { metadata } from './metadata';
import Link from 'next/link';
import { ModeToggle } from '@/components/layout/mode-toggle';
import LandingNavbar from '@/components/layout/landing-navbar';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden ">
      <LandingNavbar />
      <main className="min-h-screen flex flex-col items-center justify-center w-full">
        {children}
      </main>
      <footer className="py-8 text-center text-sm text-muted-foreground">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
        © {new Date().getFullYear()} Gravitas. All rights reserved.
      </footer>
    </div>
  );
}
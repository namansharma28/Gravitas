"use client";

import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import AuthProvider from '@/components/providers/session-provider';
import { NotificationProvider } from '@/components/notifications/notification-provider';
import Sidebar from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex min-h-screen w-full flex-col mt-20">
            {!pathname?.startsWith('/auth') && <Navbar />}
            <div className="flex w-full flex-1">
              {!pathname?.startsWith('/auth') && <Sidebar />}
              <main className="flex-1 w-full overflow-auto">
                <div className="w-full h-full">
                  {children}
                </div>
                <Toaster />
              </main>
            </div>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
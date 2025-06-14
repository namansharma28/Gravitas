"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Bell,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (status === "authenticated") {
      if ((session?.user as any)?.role !== "admin") {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        router.push("/");
      }
    } else if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [session, status, router, toast]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const navItems = [
    { href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { href: "/admin/communities", icon: <Users size={20} />, label: "Communities" },
    { href: "/admin/events", icon: <Calendar size={20} />, label: "Events" },
    { href: "/admin/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if ((session?.user as any)?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop */}
      <div 
        className={`fixed left-0 top-0 z-30 hidden h-screen border-r bg-white transition-all duration-300 dark:bg-gray-950 md:block ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Gravitas"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            {!isCollapsed && <span className="text-xl font-bold">Admin</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <Button
            variant="ghost"
            className={`w-full justify-${isCollapsed ? "center" : "start"} text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950`}
            onClick={handleSignOut}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="ml-2">Sign Out</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-30 border-b bg-white dark:bg-gray-950 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Gravitas"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold">Admin</span>
          </div>
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute left-0 top-0 h-screen w-64 bg-white p-4 dark:bg-gray-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Gravitas"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold">Admin</span>
            </div>

            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                onClick={handleSignOut}
              >
                <LogOut size={18} />
                <span className="ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 ${isCollapsed ? "md:ml-20" : "md:ml-64"} mt-16 md:mt-0`}>
        {children}
      </div>
    </div>
  );
}
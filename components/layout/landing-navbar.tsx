import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/mode-toggle';

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 backdrop-blur-sm bg-background/80">
      <Link href="/landing" className="flex items-center space-x-2">
        <Image src="/logo.svg" alt="Gravitas Logo" width={32} height={32} />
        <span className="text-xl font-bold">Gravitas</span>
      </Link>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    </nav>
  );
}
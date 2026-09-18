'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import type { User } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard = pathname === '/dashboard';
  const [isSigningOut, setIsSigningOut] = useState(false);

  // signOut() defaults to redirect:true, which assigns window.location.href to
  // the current URL. From /dashboard that is a full document reload of a page
  // the middleware then 302s to /sign-in, so signing out cost two page loads.
  // With redirect:false next-auth clears the cookie, updates the session in
  // place, and leaves the navigation to the client router.
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false });
      toast.success('Signed out', { description: 'See you next time.' });
      router.replace('/sign-in');
    } catch {
      toast.error('Could not sign you out', {
        description: 'Check your connection and try again.',
      });
      setIsSigningOut(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-3 z-40 px-3 sm:top-4 sm:px-5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-sumi/10 bg-washi/90 px-4 shadow-[0_10px_34px_rgba(30,28,26,0.12)] backdrop-blur-md sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-aizome/40">
          <svg
            viewBox="0 0 40 40"
            className="h-7 w-7 shrink-0 text-sumi transition-colors group-hover:text-shu"
            fill="none"
          >
            <path
              d="M20 4C11 5 5 12 6 21c1 9 9 15 18 14 8-1 13-7 14-14"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-display text-lg leading-none tracking-tight text-sumi">
            Not Gonna Lie
          </span>
        </Link>

        {session ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-kobicha sm:inline">
              {user?.username || user?.email}
            </span>
            {!isDashboard && (
              <Button
                render={<Link href="/dashboard" />}
                variant="outline"
                className="h-10 gap-2 rounded-full border-sumi/20 px-4 text-sm text-sumi transition-all duration-200 hover:-translate-y-0.5 hover:border-sumi hover:bg-sumi hover:text-washi active:translate-y-0 active:scale-[0.97]"
              >
                <LayoutDashboard data-icon="inline-start" />
                Dashboard
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="ghost"
              className="h-10 gap-2 rounded-full px-4 text-sm text-sumi transition-all duration-200 hover:bg-sumi/8 active:scale-[0.97]"
            >
              {isSigningOut ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <LogOut data-icon="inline-start" />
              )}
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <nav className="mr-3 hidden items-center gap-1 text-sm font-medium text-kobicha md:flex">
              <Link href="/#how-it-works" className="rounded-full px-3 py-2 transition-colors hover:bg-sumi/5 hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/40">How it works</Link>
              <Link href="/#safety" className="rounded-full px-3 py-2 transition-colors hover:bg-sumi/5 hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/40">Safety</Link>
            </nav>
            <Button
              render={<Link href="/sign-in" />}
              variant="ghost"
              className="hidden h-10 rounded-full px-4 text-sm text-sumi transition-all duration-200 hover:bg-sumi/8 active:scale-[0.97] min-[390px]:inline-flex"
            >
              Sign in
            </Button>
            <Button
              render={<Link href="/sign-up" />}
              className="h-10 rounded-full bg-sumi px-4 text-sm text-washi shadow-[0_5px_14px_rgba(30,28,26,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-sumi/90 hover:shadow-[0_8px_18px_rgba(30,28,26,0.28)] active:translate-y-0 active:scale-[0.97] sm:px-5"
            >
              Get started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import type { User } from 'next-auth';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  const pathname = usePathname();
  const [isDashboard, setIsDashboard] = useState(false);

  useEffect(() => {
    setIsDashboard(pathname === '/dashboard');
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-sumi/10 bg-washi/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
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
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-kobicha sm:inline">
              {user?.username || user?.email}
            </span>
            {!isDashboard && (
              <Button
                render={<Link href="/dashboard" />}
                variant="outline"
                size="sm"
                className="border-sumi/20 text-sumi hover:bg-sumi hover:text-washi"
              >
                <LayoutDashboard data-icon="inline-start" />
                Dashboard
              </Button>
            )}
            <Button
              onClick={() => signOut()}
              variant="ghost"
              size="sm"
              className="text-sumi hover:bg-sumi/5"
            >
              <LogOut data-icon="inline-start" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              render={<Link href="/sign-in" />}
              variant="ghost"
              size="sm"
              className="text-sumi hover:bg-sumi/5"
            >
              Sign in
            </Button>
            <Button
              render={<Link href="/sign-up" />}
              size="sm"
              className="bg-sumi text-washi hover:bg-sumi/85"
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
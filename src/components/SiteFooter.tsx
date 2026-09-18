'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Picks the footer variant for the current route. Both variants stay server
 * components — only this switch runs on the client, mirroring how Navbar
 * branches on `isDashboard`.
 */
function SiteFooter({
  marketing,
  dashboard,
}: {
  marketing: ReactNode;
  dashboard: ReactNode;
}) {
  const pathname = usePathname();
  return pathname === '/dashboard' ? dashboard : marketing;
}

export default SiteFooter;

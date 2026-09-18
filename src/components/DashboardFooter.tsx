import Link from 'next/link';

const links = [
  { label: 'Privacy', href: '/' },
  { label: 'Terms', href: '/' },
];

/**
 * Minimal footer for the signed-in dashboard.
 *
 * The marketing footer sells the product; a signed-in user has already bought
 * it. This keeps only what still earns its place — the mark, the year, and the
 * two legal links — on the dashboard's own background and content width, so it
 * reads as the end of the page rather than a second page stapled underneath.
 */
function DashboardFooter() {
  return (
    <footer className="bg-washi">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 border-t border-sumi/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-sm text-kobicha">
            <svg viewBox="0 0 40 40" className="size-4 shrink-0 text-sumi" fill="none" aria-hidden="true">
              <path
                d="M20 4C11 5 5 12 6 21c1 9 9 15 18 14 8-1 13-7 14-14"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-display tracking-tight text-sumi">Not Gonna Lie</span>
            <span aria-hidden="true" className="text-sumi/25">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>

          <nav className="-mx-2 flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full px-2 py-1 text-kobicha transition-colors hover:text-sumi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aizome/40"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;

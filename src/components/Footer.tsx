import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Create your inbox', href: '/sign-up' },
      { label: 'Sign in', href: '/sign-in' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Privacy', href: '/' },
      { label: 'Terms', href: '/' },
    ],
  },
];

function Footer() {
  return (
    <footer className="bg-sumi text-washi">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-8 border-b border-washi/15 pb-12 lg:flex-row lg:items-end">
          <div>
            <p className="font-display text-5xl leading-none tracking-[-.06em] sm:text-6xl">Not Gonna<br />Lie.</p>
            <p className="mt-4 text-sm text-washi/60">Say it straight. Keep your name out of it.</p>
          </div>
          <Button render={<Link href="/sign-up" />} nativeButton={false} className="group h-12 w-full gap-2.5 rounded-full bg-lime px-6 text-[0.95rem] leading-none text-sumi shadow-[0_10px_24px_rgba(200,242,74,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime hover:shadow-[0_14px_30px_rgba(200,242,74,0.28)] active:translate-y-0 active:scale-[0.98] [&_svg]:block sm:w-fit sm:px-7 sm:text-base">Create your inbox <ArrowUpRight data-icon="inline-end" className="size-[1.1rem] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Button>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime">本音 · honne</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-washi/60">
              本音, honne — the voice people usually keep to themselves. We
              give it somewhere to go, without a name attached to it.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-washi/70 transition-colors hover:text-lime"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-washi/15 pt-6 text-xs text-washi/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Not Gonna Lie. Say it straight.</p>
          <p className="tracking-wide">正直 · honesty, kept anonymous</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

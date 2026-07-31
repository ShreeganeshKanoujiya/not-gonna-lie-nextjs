import Link from 'next/link';

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
    <footer className="border-t border-sumi/10 bg-washi">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg text-sumi">Not Gonna Lie</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-kobicha">
              本音, honne — the voice people usually keep to themselves. We
              give it somewhere to go, without a name attached to it.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-kobicha">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-sumi/80 transition-colors hover:text-shu"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-sumi/10 pt-6 text-xs text-kobicha sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Not Gonna Lie. Say it straight.</p>
          <p className="tracking-wide">正直 · honesty, kept anonymous</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
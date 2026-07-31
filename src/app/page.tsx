import Link from 'next/link';
import { ArrowRight, EyeOff, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    number: '01',
    title: 'Claim your link',
    body: 'Create an account and get a single, verified link tied to your name — not your inbox.',
  },
  {
    number: '02',
    title: 'Share it anywhere',
    body: 'Drop it in your bio, your group chat, your story. Anyone can write to you without signing up.',
  },
  {
    number: '03',
    title: 'Read it honestly',
    body: 'Messages land in your dashboard with no sender attached. You decide what happens next.',
  },
];

const pillars = [
  {
    icon: EyeOff,
    title: 'Anonymous by default',
    body: 'The sender is never stored against the message. Not to you, not to us.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified accounts',
    body: 'Every inbox belongs to a real, email-verified person — so replies mean something.',
  },
  {
    icon: SlidersHorizontal,
    title: 'You hold the switch',
    body: 'Turn message-receiving on or off in one tap. Nothing arrives without your say-so.',
  },
];

export default function Home() {
  return (
    <main className="bg-washi">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] opacity-[0.06]">
          <svg viewBox="0 0 200 200" fill="none">
            <path
              d="M100 20c-46 5-80 40-75 88 5 46 47 78 92 72 41-5 68-36 72-72"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className="text-sumi"
            />
          </svg>
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-shu/25 bg-shu/5 px-4 py-1.5 text-sm text-shu">
              本音 · honne — what you'd say if it were safe to
            </div>
            <h1 className="font-display text-4xl leading-[1.12] tracking-tight text-sumi sm:text-5xl lg:text-6xl">
              Say the honest thing.
              <br />
              Keep your name out of it.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-kobicha sm:text-lg">
              Not Gonna Lie gives your friends, teammates, and followers a
              verified line to your inbox — the message reaches you, the
              sender stays invisible.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href="/sign-up" />}
                nativeButton={false}
                size="lg"
                className="rounded-full bg-sumi px-6 text-washi hover:bg-sumi/85"
              >
                Create your inbox
                <ArrowRight data-icon="inline-end" className="ml-1" />
              </Button>
              <Button
                render={<Link href="#how-it-works" />}
                nativeButton={false}
                size="lg"
                variant="outline"
                className="rounded-full border-sumi/20 px-6 text-sumi hover:bg-sumi/5"
              >
                See how it works
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-aizome/10 blur-3xl" />
            <div className="rounded-[2rem] border border-sumi/10 bg-card p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-kobicha">
                    Preview
                  </p>
                  <p className="font-display text-lg text-sumi">
                    Your anonymous inbox
                  </p>
                </div>
                <span className="rounded-full bg-aizome/10 px-3 py-1 text-xs text-aizome">
                  Verified
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-sumi/10 bg-washi p-4">
                  <p className="text-xs text-kobicha">Unsigned message</p>
                  <p className="mt-2 text-sm leading-6 text-sumi">
                    I never told you this, but your notes got me through
                    finals. Thank you.
                  </p>
                </div>
                <div className="rounded-xl border border-sumi/10 bg-washi p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-kobicha">Accepting messages</span>
                    <span className="rounded-full bg-shu/10 px-3 py-1 text-shu">
                      On
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-kobicha">Your link</span>
                    <span className="truncate text-sumi/70">/u/username</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbering earns its place */}
      <section id="how-it-works" className="border-t border-sumi/10 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-kobicha">
            How it works
          </p>
          <h2 className="mt-2 font-display text-3xl text-sumi sm:text-4xl">
            Three steps, one honest inbox
          </h2>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="border-t border-sumi/15 pt-5">
                <span className="font-display text-sm text-shu">
                  {step.number}
                </span>
                <h3 className="mt-2 font-display text-lg text-sumi">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-kobicha">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-t border-sumi/10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-sumi/10 bg-card shadow-none">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <Icon className="h-5 w-5 text-aizome" />
                  <p className="font-display text-base text-sumi">{title}</p>
                  <p className="text-sm leading-6 text-kobicha">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-sumi/10 bg-sumi">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 sm:px-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl text-washi sm:text-3xl">
              Your honest inbox is one link away.
            </h2>
            <p className="mt-2 text-sm text-washi/60">
              Free to set up. Takes under a minute.
            </p>
          </div>
          <Button
            render={<Link href="/sign-up" />}
            nativeButton={false}
            size="lg"
            className="rounded-full bg-washi px-6 text-sumi hover:bg-washi/90"
          >
            Create your inbox
            <ArrowRight data-icon="inline-end" className="ml-1" />
          </Button>
        </div>
      </section>
    </main>
  );
}
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, MessageCircleMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1f2937_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/55">Not Gonna Lie</p>
            <p className="text-base font-medium text-white">Anonymous feedback with a human edge</p>
          </div>
          <div className="hidden gap-3 sm:flex">
            <Button asChild variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#f8fafc] text-slate-950 hover:bg-white">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Anonymous messages, verified accounts
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Create a space for honest feedback without exposing the sender.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              Not Gonna Lie lets people send anonymous messages, while you keep control over your inbox, visibility, and reply flow.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-white px-6 text-slate-950 hover:bg-white/90">
                <Link href="/sign-up">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Card className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur">
                <CardContent className="flex h-full items-start gap-3 p-4">
                  <MessageCircleMore className="mt-1 h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="font-medium">Anonymous</p>
                    <p className="text-sm text-white/65">Messages stay detached from the sender.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur">
                <CardContent className="flex h-full items-start gap-3 p-4">
                  <ShieldCheck className="mt-1 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="font-medium">Verified</p>
                    <p className="text-sm text-white/65">Accounts are protected behind sign-in and verification.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/5 text-white shadow-none backdrop-blur">
                <CardContent className="flex h-full items-start gap-3 p-4">
                  <Sparkles className="mt-1 h-5 w-5 text-amber-300" />
                  <div>
                    <p className="font-medium">Controlled</p>
                    <p className="text-sm text-white/65">Decide what you accept and what gets surfaced.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-emerald-400/20 blur-3xl" />
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/45">Preview</p>
                  <p className="text-lg font-semibold">Your anonymous inbox</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.15)]" />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm text-white/55">Someone sent you a message</p>
                  <p className="mt-2 text-base leading-6 text-white/90">You have a great energy. Keep posting; it makes the day better.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm text-white/55">Controls</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>Accept messages</span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">Enabled</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>Your profile link</span>
                    <span className="truncate text-white/60">/u/your-name</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

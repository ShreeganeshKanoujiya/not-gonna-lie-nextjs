import { Card, CardContent } from '@/components/ui/card';

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-full bg-sumi/10 ${className}`} />;
}

export function MessageCardSkeleton() {
  return (
    <div className="rounded-[1.5rem] border border-sumi/10 bg-card p-5 shadow-[0_8px_24px_rgba(30,28,26,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Shimmer className="h-5 w-[92%]" />
          <Shimmer className="h-5 w-[70%]" />
        </div>
        <Shimmer className="size-9 shrink-0" />
      </div>
      <div className="mt-6 h-px w-full bg-sumi/10" />
      <div className="mt-4 flex items-center gap-2">
        <Shimmer className="size-1.5" />
        <Shimmer className="h-3 w-44 max-w-[60%]" />
      </div>
    </div>
  );
}

/**
 * Mirrors the real dashboard layout so the page doesn't jump when data lands.
 * Used both by the route-level loading.tsx and while the client fetches.
 */
export function DashboardSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your dashboard"
      className="min-h-[calc(100svh-1px)] bg-washi px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:pb-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header banner */}
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-sumi px-5 py-8 shadow-[0_18px_40px_rgba(30,28,26,0.12)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_8%_20%,#e95776_0,transparent_22rem),radial-gradient(circle_at_88%_85%,#7063ff_0,transparent_24rem)]" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 h-7 w-44 animate-pulse rounded-full bg-washi/15" />
              <div className="h-11 w-64 max-w-full animate-pulse rounded-2xl bg-washi/15 sm:h-14 sm:w-80" />
              <div className="mt-4 space-y-2">
                <div className="h-3.5 w-full max-w-xl animate-pulse rounded-full bg-washi/10" />
                <div className="h-3.5 w-40 animate-pulse rounded-full bg-washi/10" />
              </div>
            </div>
            <div className="flex w-full items-center gap-3 rounded-2xl border border-washi/15 bg-washi/10 px-4 py-3 backdrop-blur sm:w-fit">
              <div className="size-10 shrink-0 animate-pulse rounded-xl bg-washi/20" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-washi/20" />
                <div className="h-3.5 w-32 animate-pulse rounded-full bg-washi/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Share link + accepting-messages card */}
        <Card className="mt-5 overflow-hidden rounded-[1.75rem] border-sumi/10 bg-card shadow-[0_10px_30px_rgba(30,28,26,0.06)]">
          <CardContent className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <Shimmer className="h-3 w-36" />
              <div className="mt-3 space-y-2">
                <Shimmer className="h-3.5 w-full max-w-md" />
                <Shimmer className="h-3.5 w-40" />
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="h-11 min-w-0 flex-1 animate-pulse rounded-xl border border-sumi/12 bg-washi" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-sumi/10 sm:w-32" />
              </div>
            </div>
            <div className="flex min-h-28 min-w-0 items-center justify-between gap-5 rounded-2xl bg-sumi p-5 lg:min-w-80">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-40 max-w-full animate-pulse rounded-full bg-washi/20" />
                <div className="h-3 w-48 max-w-full animate-pulse rounded-full bg-washi/10" />
              </div>
              <div className="h-8 w-14 shrink-0 animate-pulse rounded-xl bg-washi/20" />
            </div>
          </CardContent>
        </Card>

        {/* Inbox header + actions */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="mt-2 h-8 w-52 max-w-full rounded-xl" />
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Shimmer className="h-11 flex-1 rounded-xl sm:w-32 sm:flex-none" />
            <Shimmer className="h-11 flex-1 rounded-xl sm:w-32 sm:flex-none" />
          </div>
        </div>

        {/* Message grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <MessageCardSkeleton key={index} />
          ))}
        </div>

        <span className="sr-only" role="status">
          Loading your dashboard…
        </span>
      </div>
    </main>
  );
}

export default DashboardSkeleton;

"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

// The navbar is fixed at top-3 (12px) / sm:top-4 (16px) with an h-16 pill, so
// it ends at 76px on mobile and 80px from `sm` up. Toasts clear it with a gap
// instead of landing on top of it.
const DESKTOP_OFFSET = { top: "5.75rem" } // 92px
const MOBILE_OFFSET = { top: "5.5rem", left: "1rem", right: "1rem" } // 88px

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // Hardcoded rather than read from next-themes: no ThemeProvider is
      // mounted, so useTheme() returned undefined and fell back to "system",
      // which let a visitor's dark OS flip the toast shell to dark while the
      // app's tokens stayed light. The app itself is light-only — `.dark` is
      // never set on <html>.
      theme="light"
      position="top-center"
      duration={5000}
      visibleToasts={3}
      offset={DESKTOP_OFFSET}
      mobileOffset={MOBILE_OFFSET}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "color-mix(in oklch, var(--sumi) 20%, transparent)",
          "--border-radius": "1rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // bg-card sits only a shade above bg-washi, so the shadow and border
          // do the separating — the same trick the dashboard cards use.
          toast:
            "cn-toast rounded-2xl border border-sumi/20 bg-card px-4 py-3.5 text-sumi shadow-[0_16px_40px_rgba(30,28,26,0.22)]",
          title: "font-semibold tracking-tight text-sumi",
          description: "mt-1 text-sm leading-5 text-kobicha",
          success: "border-l-4 border-l-aizome [&_[data-icon]]:text-aizome",
          error: "border-l-4 border-l-destructive [&_[data-icon]]:text-destructive",
          warning: "border-l-4 border-l-shu [&_[data-icon]]:text-shu",
          info: "border-l-4 border-l-aizome [&_[data-icon]]:text-aizome",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

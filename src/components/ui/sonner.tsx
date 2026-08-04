"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      duration={4500}
      visibleToasts={3}
      offset="1rem"
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
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast rounded-xl border border-sumi/15 bg-popover px-4 py-3 text-popover-foreground shadow-lg shadow-sumi/10",
          title: "font-semibold tracking-tight",
          description: "mt-1 text-sm text-kobicha",
          success: "border-l-4 border-l-aizome",
          error: "border-l-4 border-l-shu",
          warning: "border-l-4 border-l-kobicha",
          info: "border-l-4 border-l-aizome",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

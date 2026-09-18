import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Gonna Lie",
};

/**
 * Nested layout for the signed-in surfaces.
 *
 * This used to render its own <html>, <body>, font and AuthProvider, which made
 * it a second root layout nested inside the real one at src/app/layout.tsx. The
 * browser discards nested <html>/<body> tags while parsing, so the markup React
 * tried to hydrate never matched what the server sent. The root layout already
 * provides the document, the fonts, the session provider and the chrome.
 */
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

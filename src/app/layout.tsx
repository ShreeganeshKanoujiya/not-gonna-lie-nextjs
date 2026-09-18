import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DashboardFooter from "@/components/DashboardFooter";
import SiteFooter from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";

const shipporiMincho = Shippori_Mincho({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const zenKaku = Zen_Kaku_Gothic_New({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Not Gonna Lie",
  description:
    "Anonymous messages, verified identities, and a cleaner way to say the honest thing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${shipporiMincho.variable} ${zenKaku.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-washi font-sans text-sumi">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <SiteFooter marketing={<Footer />} dashboard={<DashboardFooter />} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { WhatsAppButton } from "@/components/whatsapp-button";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Salman Trading - Smart Investment Platform",
  description: "Grow your wealth with Salman Trading. Secure, high-return investment plans with daily profits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            {children}
            <WhatsAppButton />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

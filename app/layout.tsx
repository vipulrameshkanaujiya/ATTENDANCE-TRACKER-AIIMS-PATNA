import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SplashScreen } from "@/components/ui/SplashScreen";

export const metadata: Metadata = {
  title: "BunkBuddy — AIIMS Patna",
  description: "Attendance Tracker for MBBS 2024 Batch, AIIMS Patna",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BunkBuddy",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
        <SplashScreen />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

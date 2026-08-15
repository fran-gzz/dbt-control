import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/components/auth-provider";
import { ReadingsBoundary } from "@/components/readings-provider";
import { MealsBoundary } from "@/components/meals-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DBT Control",
  description:
    "Registrá tus mediciones de glucemia, seguí tus tendencias y entendé cómo la comida y la actividad afectan tus niveles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ReadingsBoundary>
              <MealsBoundary>
                <AppShell>{children}</AppShell>
              </MealsBoundary>
            </ReadingsBoundary>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

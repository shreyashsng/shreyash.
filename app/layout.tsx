import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { NoiseOverlay } from "@/components/ui/noise-overlay"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Shreyash Singh | Portfolio',
  description: 'Software Engineer focusing on building modern web applications and digital experiences.',
  keywords: ['Software Engineer', 'Web Developer', 'Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'Shreyash Singh' }],
  creator: 'Shreyash Singh',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shreyashsng.live',
    title: 'Shreyash Singh | Software Engineer',
    description: 'Software Engineer focusing on building modern web applications and digital experiences.',
    siteName: 'Shreyash Singh | Portfolio'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shreyash Singh - Software Engineer',
    description: 'Software Engineer focusing on building modern web applications and digital experiences.',
    creator: '@shreyashsng'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="portfolio-theme"
        >
          {children}
          <NoiseOverlay />
        </ThemeProvider>
      </body>
    </html>
  );
}

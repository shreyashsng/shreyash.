import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { NoiseOverlay } from "@/components/ui/noise-overlay"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function getMetadata() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data } = await supabase
    .from('metadata')
    .select('*')
    .single()
  
  return data
}

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getMetadata()
  
  return {
    title: meta?.title || 'Shreyash Singh | Portfolio',
    description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
    keywords: meta?.keywords || ['Software Engineer', 'Web Developer', 'Next.js', 'React', 'TypeScript'],
    authors: [{ name: meta?.author || 'Shreyash Singh' }],
    creator: meta?.author || 'Shreyash Singh',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://shreyashsng.live',
      title: meta?.title || 'Shreyash Singh | Software Engineer',
      description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
      siteName: meta?.title || 'Shreyash Singh | Portfolio',
      images: meta?.og_image ? [meta.og_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.title || 'Shreyash Singh - Software Engineer',
      description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
      creator: meta?.twitter_handle ? `@${meta.twitter_handle}` : '@shreyashsng',
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
    }
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

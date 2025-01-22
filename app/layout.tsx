import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { NoiseOverlay } from "@/components/ui/noise-overlay"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SpeedInsights } from "@vercel/speed-insights/next"

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
  
  // Helper function to check if image URL is accessible
  async function isImageAccessible(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  // Determine the best image URL to use with absolute path
  const getImageUrl = async () => {
    if (meta?.og_image) {
      const isAccessible = await isImageAccessible(meta.og_image)
      if (isAccessible) return meta.og_image
    }
    
    // Use absolute URL for fallback image
    return 'https://shreyash.social/profile-fallback.png'
  }

  const imageUrl = await getImageUrl()
  
  return {
    title: meta?.title || 'Shreyash Singh | Portfolio',
    description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
    keywords: meta?.keywords || ['Software Engineer', 'Web Developer', 'Next.js', 'React', 'TypeScript'],
    authors: [{ name: meta?.author || 'Shreyash Singh' }],
    creator: meta?.author || 'Shreyash Singh',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://shreyash.social',
      title: meta?.title || 'Shreyash Singh | Software Engineer',
      description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
      siteName: meta?.title || 'Shreyash Singh | Portfolio',
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: 'Shreyash Singh',
        type: 'image/png'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta?.title || 'Shreyash Singh - Software Engineer',
      description: meta?.description || 'Software Engineer focusing on building modern web applications and digital experiences.',
      creator: meta?.twitter_handle ? `@${meta.twitter_handle}` : '@shreyashsng',
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: 'Shreyash Singh'
      }],
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
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}

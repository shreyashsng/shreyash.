import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Content Management',
  description: 'Manage your portfolio content and projects',
  robots: 'noindex, nofollow' // Prevent search engines from indexing admin pages
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
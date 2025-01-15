import Link from 'next/link'
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  value: string
  href: string
  isActive?: boolean
}

export function SiteNav() {
  const navItems: NavItem[] = [
    { label: 'Work', value: '12 projects', href: '/work' },
    { label: 'Timeline', value: '24 entries', href: '/timeline' },
    { label: 'Videos', value: '88 entries', href: '/videos' },
    { label: 'About', value: '25 years', href: '/about' },
    { label: 'Colophon', value: '5 topics', href: '/colophon' },
  ]

  return (
    <nav className="fixed top-16 right-16 space-y-3">
      {navItems.map((item) => (
        <Link 
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center justify-between group w-56 py-0.5",
            "text-sm text-muted-foreground hover:text-foreground transition-colors"
          )}
        >
          <span>{item.label}</span>
          <span>{item.value}</span>
        </Link>
      ))}
    </nav>
  )
} 
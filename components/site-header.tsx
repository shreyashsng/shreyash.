import Link from 'next/link'

export function SiteHeader() {
  return (
    <div className="relative">
      <Link 
        href="/" 
        className="absolute -left-24 top-0 text-sm text-gray-400 hover:text-gray-200 inline-flex items-center"
      >
        ← Index
      </Link>
      
      <h1 className="text-3xl font-serif text-center mb-16 mt-0">Work</h1>
      
      <p className="text-gray-400 max-w-lg mb-24">
        I've been a web developer for around 3 years now, creating unique
        marketing, e-commerce and web applications for clients. Below is a selection
        of my work from the last few years.
      </p>
    </div>
  )
} 
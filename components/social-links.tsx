"use client"

import { motion } from "framer-motion"
import { TwitterLogoIcon, GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons"

const socialLinks = [
  {
    name: 'Twitter',
    icon: <TwitterLogoIcon className="w-4 h-4" />,
    href: 'https://twitter.com/shreyashsng'
  },
  {
    name: 'GitHub',
    icon: <GitHubLogoIcon className="w-4 h-4" />,
    href: 'https://github.com/shreyashsng'
  },
  {
    name: 'LinkedIn',
    icon: <LinkedInLogoIcon className="w-4 h-4" />,
    href: 'https://linkedin.com/in/shreyashsng'
  }
]

export function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socialLinks.map((link) => (
        <motion.a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {link.icon}
        </motion.a>
      ))}
    </div>
  )
} 
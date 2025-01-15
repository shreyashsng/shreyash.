"use client"

import { Button } from "@/components/ui/button"
import { SunIcon, MoonIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { GitHubLogoIcon, ExternalLinkIcon } from "@radix-ui/react-icons"
import { GridPattern } from "@/components/ui/grid-pattern"
import { supabase } from "@/lib/supabase"
import Image from 'next/image'

interface Project {
  id: number
  title: string
  date: string
  description: string
  image_url: string
  github_url: string
  live_url: string
}

interface IntroContent {
  hero_text: string
  intro_text: string
  availability_text: string
  work_intro: string
  email: string
}

export default function Home() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState<IntroContent>({
    hero_text: "Software Engineer working on building impactful digital experiences.",
    intro_text: "I am a Software Engineer focusing on building modern web applications and digital experiences.",
    availability_text: "I have limited availability, but I am open to hearing about your project! If you're looking for a developer, please feel free to reach out via",
    work_intro: "I've been a web developer for around 3 years now, creating unique marketing, e-commerce and web applications for clients. Below is a selection of my work from the last few years.",
    email: "shreyashsingh1441@gmail.com"
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchContent() {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .single()

      if (error) {
        console.error('Supabase error:', error.message)
        return // Keep default state values
      }
      
      if (data) {
        setContent(prev => ({
          ...prev,
          hero_text: data.hero_text || prev.hero_text,
          intro_text: data.intro_text || prev.intro_text,
          availability_text: data.availability_text || prev.availability_text,
          work_intro: data.work_intro || prev.work_intro,
          email: data.email || prev.email
        }))
      }
    } catch (error) {
      console.error('Error fetching content:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      await Promise.all([fetchContent(), fetchProjects()])
      setupRealtimeSubscription()
      setMounted(true)
      setIsLoading(false)
    }
    
    initialize()
  }, [])

  function setupRealtimeSubscription() {
    const contentSubscription = supabase
      .channel('content-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'content' },
        (payload) => {
          console.log('Content updated:', payload.new)
          setContent(prev => ({
            ...prev,
            hero_text: payload.new.hero_text || prev.hero_text,
            intro_text: payload.new.intro_text || prev.intro_text,
            availability_text: payload.new.availability_text || prev.availability_text,
            work_intro: payload.new.work_intro || prev.work_intro,
            email: payload.new.email || prev.email
          }))
        })
      .subscribe()

    const projectSubscription = supabase
      .channel('projects-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProjects(current => [payload.new as Project, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setProjects(current => 
              current.map(p => p.id === payload.new.id ? payload.new as Project : p)
            )
          } else if (payload.eventType === 'DELETE') {
            setProjects(current => current.filter(p => p.id !== payload.old.id))
          }
        })
      .subscribe()

    return () => {
      supabase.removeChannel(contentSubscription)
      supabase.removeChannel(projectSubscription)
    }
  }

  async function fetchProjects() {
    console.log('Fetching projects...')
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Raw response:', { data, error })

      if (error) {
        console.error('Supabase error:', error.message)
        return
      }

      if (data) {
        console.log('Setting projects:', data)
        setProjects(data)
      } else {
        console.log('No projects found')
      }
    } catch (error) {
      console.error('Error fetching projects:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const pageTransition = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren"
      }
    },
    exit: { opacity: 0 }
  }

  const contentBlur = {
    initial: { 
      opacity: 0,
      filter: "blur(8px)",
      y: 20
    },
    animate: { 
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] // Custom ease curve for smoother animation
      }
    },
    exit: { 
      opacity: 0,
      filter: "blur(8px)",
      y: 10,
      transition: { duration: 0.4 }
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="fixed top-6 left-8">
          <h3 className="text-muted-foreground flex items-center gap-2">
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors duration-200"
            >
              Shreyash Singh
            </Link>
            <div className="h-6 w-6" />
          </h3>
        </div>
      </main>
    )
  }

  return (
    <motion.main 
      className="min-h-screen text-foreground pb-16 relative"
      variants={pageTransition}
      initial="initial"
      animate={isLoading ? "initial" : "animate"}
      exit="exit"
    >
      <div className="absolute inset-0 -z-10">
        <GridPattern 
          width={24} 
          height={24} 
          className="absolute inset-0 text-zinc-800/[0.15] [mask-image:radial-gradient(white,transparent_85%)]" 
          strokeDasharray="2 2"
        />
      </div>

      <motion.div 
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-transparent backdrop-blur-sm" />
        <div className="relative max-w-screen-2xl mx-auto px-8 py-4">
          <h3 className="text-muted-foreground flex items-center gap-2">
            <Link 
              href="/" 
              className="hover:text-foreground transition-colors duration-200"
            >
              Shreyash Singh
            </Link>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground h-6 w-6 p-0.5 transition-colors duration-200 hover:text-foreground"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          </h3>
        </div>
      </motion.div>

      <motion.div 
        className="max-w-xl mx-auto px-8 pt-32"
        variants={stagger}
        initial="initial"
        animate={isLoading ? "initial" : "animate"}
      >
        <motion.h1 
          className="text-2xl md:text-3xl font-serif mb-4 leading-relaxed"
          variants={contentBlur}
        >
          {content.hero_text || ""}
        </motion.h1>

        <motion.div 
          className="hidden md:flex text-sm text-muted-foreground items-center gap-2 mb-8"
          variants={contentBlur}
        >
          <span>© {new Date().getFullYear()} Shreyash Singh</span>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span>1 active visitor (that&apos;s you!)</span>
        </motion.div>

        <motion.div 
          className="space-y-6 mt-4 md:mt-0"
          variants={stagger}
        >
          <motion.p 
            className="text-muted-foreground text-sm md:text-base"
            variants={contentBlur}
          >
            {content.intro_text}
          </motion.p>

          <motion.p 
            className="text-muted-foreground text-sm md:text-base"
            variants={contentBlur}
          >
            {content.availability_text}{' '}
            <motion.a 
              href={`mailto:${content.email}`}
              className="text-primary hover:text-primary/90 underline-offset-4 hover:underline transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              email ↗
            </motion.a>
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-16 md:mt-24"
          variants={stagger}
        >
          <motion.h2 
            className="text-3xl font-serif mb-6"
            variants={contentBlur}
          >
            Projects
          </motion.h2>
          
          <motion.p 
            className="text-muted-foreground mb-12"
            variants={contentBlur}
          >
            {content.work_intro}
          </motion.p>

          <motion.div 
            className="space-y-16"
            variants={stagger}
          >
            {projects.map((project) => (
              <motion.div 
                key={project.id}
                className="border-t border-zinc-800 pt-8 group relative"
                variants={contentBlur}
              >
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-900 mb-6">
                  {project.image_url && (
                    <Image 
                      src={project.image_url} 
                      alt={project.title}
                      width={1920}
                      height={1080}
                      className="object-cover w-full h-full"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      {project.github_url && (
                        <motion.a
                          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <GitHubLogoIcon className="w-5 h-5" />
                        </motion.a>
                      )}
                      {project.live_url && (
                        <motion.a
                          href={project.live_url}
          target="_blank"
          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ExternalLinkIcon className="w-5 h-5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-baseline gap-4">
                  <h3 className="text-lg font-light tracking-wide text-zinc-300">{project.title}</h3>
                  <div className="h-[1px] bg-zinc-800 flex-grow"></div>
                  <span className="text-sm text-zinc-500 whitespace-nowrap">{project.date}</span>
    </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.main>
  )
}

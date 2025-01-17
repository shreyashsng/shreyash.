"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, PlusCircle } from "lucide-react"
import { EditProjectModal } from "@/components/ui/edit-project-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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

interface SiteMetadata {
  id: number
  title: string
  description: string
  keywords: string[]
  author: string
  og_image: string | null
  twitter_handle: string
}

const emptyProject: Omit<Project, 'id'> = {
  title: "New Project",
  date: "Present",
  description: "",
  image_url: "",
  github_url: "",
  live_url: ""
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [introContent, setIntroContent] = useState<IntroContent>({
    hero_text: "",
    intro_text: "",
    availability_text: "",
    work_intro: "",
    email: ""
  })
  const [metadata, setMetadata] = useState<SiteMetadata>({
    id: 1,
    title: '',
    description: '',
    keywords: [],
    author: '',
    og_image: null,
    twitter_handle: ''
  })
  const [isMetadataSaving, setIsMetadataSaving] = useState(false)

  useEffect(() => {
    fetchContent()
    fetchProjects()
    fetchMetadata()
    const cleanup = setupRealtimeSubscription()
    return () => cleanup()
  }, [])

  function setupRealtimeSubscription() {
    const projectSubscription = supabase
      .channel('projects-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'projects' }, 
        (payload) => {
          setProjects(current => [payload.new as Project, ...current])
        })
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects' },
        (payload) => {
          setProjects(current => 
            current.map(p => p.id === payload.new.id ? payload.new as Project : p)
          )
        })
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'projects' },
        (payload) => {
          setProjects(current => current.filter(p => p.id !== payload.old.id))
          if (selectedProject?.id === payload.old.id) {
            setSelectedProject(null)
          }
        })
      .subscribe()

    return () => {
      supabase.removeChannel(projectSubscription)
    }
  }

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      alert('Failed to fetch projects')
    }
  }

  async function handleSaveProject(updatedProject: Project) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title: updatedProject.title,
          date: updatedProject.date,
          description: updatedProject.description,
          image_url: updatedProject.image_url,
          github_url: updatedProject.github_url,
          live_url: updatedProject.live_url
        })
        .eq('id', updatedProject.id)

      if (error) {
        console.error('Supabase error:', error.message)
        throw error
      }
      
      // Update local state
      setProjects(current => 
        current.map(p => p.id === updatedProject.id ? updatedProject : p)
      )
      
      // Close modal
      setSelectedProject(null)
    } catch (error) {
      console.error('Error updating project:', error instanceof Error ? error.message : 'Unknown error')
      alert('Failed to update project')
    }
  }

  async function handleDeleteProject(id: number) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setProjects(current => current.filter(p => p.id !== id))
      setSelectedProject(null)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  async function handleAddProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([emptyProject])
        .select()
        .single()

      if (error) throw error
      if (data) {
        setProjects(current => [data, ...current])
        setSelectedProject(data)
      }
    } catch (error) {
      console.error('Error adding project:', error)
      alert('Failed to add project')
    }
  }

  async function updateIntroContent() {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('content')
        .update({
          hero_text: introContent.hero_text,
          intro_text: introContent.intro_text,
          availability_text: introContent.availability_text,
          work_intro: introContent.work_intro,
          email: introContent.email
        })
        .eq('id', 1)

      if (error) throw error
      
      // Show success message
      alert('Content updated successfully')
    } catch (error) {
      console.error('Error updating content:', error)
      alert('Failed to update content')
    } finally {
      setIsSaving(false)
    }
  }

  async function fetchContent() {
    setIsLoading(true)
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
        setIntroContent(data)
      }
    } catch (error) {
      console.error('Error fetching content:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchMetadata() {
    try {
      const { data, error } = await supabase
        .from('metadata')
        .select('*')
        .single()

      if (error) throw error
      if (data) setMetadata(data)
    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }

  async function updateMetadata() {
    setIsMetadataSaving(true)
    try {
      const { error } = await supabase
        .from('metadata')
        .update({
          title: metadata.title,
          description: metadata.description,
          keywords: metadata.keywords,
          author: metadata.author,
          og_image: metadata.og_image,
          twitter_handle: metadata.twitter_handle
        })
        .eq('id', 1)

      if (error) throw error
      alert('Metadata updated successfully')
    } catch (error) {
      console.error('Error updating metadata:', error)
      alert('Failed to update metadata')
    } finally {
      setIsMetadataSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-xl font-medium">Content Management</h1>
        </div>

        <Tabs defaultValue="intro" className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="intro">Introduction</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="intro">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>Introduction Content</CardTitle>
                <CardDescription>Edit your homepage introduction sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Hero Text</Label>
                  <Textarea
                    value={introContent.hero_text}
                    onChange={(e) => setIntroContent(prev => ({ ...prev, hero_text: e.target.value }))}
                    rows={3}
                    className="bg-zinc-800/30 border-zinc-700/50 resize-none"
                    placeholder="Your main hero text..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Introduction Text</Label>
                  <Textarea
                    value={introContent.intro_text}
                    onChange={(e) => setIntroContent(prev => ({ ...prev, intro_text: e.target.value }))}
                    rows={2}
                    className="bg-zinc-800/30 border-zinc-700/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability Text</Label>
                  <Textarea
                    value={introContent.availability_text}
                    onChange={(e) => setIntroContent(prev => ({ ...prev, availability_text: e.target.value }))}
                    rows={2}
                    className="bg-zinc-800/30 border-zinc-700/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    value={introContent.email}
                    onChange={(e) => setIntroContent(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-zinc-800/30 border-zinc-700/50"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Work Introduction</Label>
                  <Textarea
                    value={introContent.work_intro}
                    onChange={(e) => setIntroContent(prev => ({ ...prev, work_intro: e.target.value }))}
                    rows={3}
                    className="bg-zinc-800/30 border-zinc-700/50 resize-none"
                  />
                </div>

                <Button 
                  onClick={updateIntroContent}
                  disabled={isSaving}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage your portfolio projects</CardDescription>
                </div>
                <Button 
                  onClick={handleAddProject}
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div 
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="group cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-all duration-200"
                    >
                      <div className="aspect-[16/10] rounded-lg bg-zinc-800 mb-4 overflow-hidden">
                        {project.image_url && (
                          <Image 
                            src={project.image_url} 
                            alt={project.title}
                            width={1920}
                            height={1080}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-zinc-200">{project.title}</h3>
                          <span className="text-sm text-zinc-400">{project.date}</span>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
                <CardDescription>Manage your site's SEO settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Site Title</Label>
                  <Input
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-zinc-800/30 border-zinc-700/50"
                    placeholder="Shreyash Singh | Portfolio"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended length: 50-60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="bg-zinc-800/30 border-zinc-700/50 resize-none"
                    placeholder="Software Engineer focusing on building modern web applications..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended length: 150-160 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    value={metadata.keywords.join(', ')}
                    onChange={(e) => setMetadata(prev => ({ 
                      ...prev, 
                      keywords: e.target.value.split(',').map(k => k.trim()) 
                    }))}
                    className="bg-zinc-800/30 border-zinc-700/50"
                    placeholder="Software Engineer, Web Developer, Next.js, React"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={metadata.author}
                    onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                    className="bg-zinc-800/30 border-zinc-700/50"
                    placeholder="Shreyash Singh"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Twitter Handle</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                    <Input
                      value={metadata.twitter_handle}
                      onChange={(e) => setMetadata(prev => ({ ...prev, twitter_handle: e.target.value }))}
                      className="bg-zinc-800/30 border-zinc-700/50 pl-8"
                      placeholder="shreyashsng"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <div className="space-y-4">
                    <Input
                      value={metadata.og_image || ''}
                      onChange={(e) => setMetadata(prev => ({ ...prev, og_image: e.target.value }))}
                      className="bg-zinc-800/30 border-zinc-700/50"
                      placeholder="https://your-domain.com/og-image.png"
                    />
                    <div className="aspect-[1200/630] relative rounded-lg overflow-hidden bg-zinc-800/50">
                      <Image
                        src={metadata.og_image || '/profile-fallback.png'}
                        alt="OG Image Preview"
                        width={1200}
                        height={630}
                        className="object-cover"
                        onError={(e) => {
                          // Fallback to default image if custom image fails
                          const img = e.target as HTMLImageElement
                          img.src = '/profile-fallback.png'
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 1200x630 pixels. Will fallback to default image if URL is invalid.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={updateMetadata}
                  disabled={isMetadataSaving}
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                >
                  {isMetadataSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isMetadataSaving ? "Saving..." : "Save Metadata"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedProject && (
        <EditProjectModal
          project={selectedProject}
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
        />
      )}
    </div>
  )
} 
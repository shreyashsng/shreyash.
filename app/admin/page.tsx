"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, PlusCircle, Upload, Link as LinkIcon, LogOut } from "lucide-react"
import { EditProjectModal } from "@/components/ui/edit-project-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { useRouter } from "next/navigation"

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
  const router = useRouter()

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
      // Validate image URL if provided
      if (metadata.og_image) {
        const isValidImage = await validateImage(metadata.og_image)
        if (!isValidImage) {
          alert('Invalid image URL. Please ensure the image meets the requirements.')
          setIsMetadataSaving(false)
          return
        }
      }

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
    } catch (error) {
      console.error('Error updating metadata:', error)
      alert('Failed to update metadata')
    } finally {
      setIsMetadataSaving(false)
    }
  }

  // Add image validation function
  async function validateImage(url: string): Promise<boolean> {
    try {
      // Handle Google Drive URLs
      if (url.includes('drive.google.com')) {
        // Extract file ID from Google Drive URL
        const fileId = url.match(/[-\w]{25,}/);
        if (!fileId) return false;
        
        // Convert to direct download URL
        const directUrl = `https://drive.google.com/uc?export=view&id=${fileId[0]}`;
        
        // Update the metadata with direct URL
        setMetadata(prev => ({ ...prev, og_image: directUrl }));
        
        // Validate the direct URL
        const response = await fetch(directUrl, { method: 'HEAD' });
        if (!response.ok) return false;
        
        return true;
      }

      // Handle regular URLs
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) return false

      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) return false

      return true
    } catch {
      return false
    }
  }

  async function uploadImage(file: File) {
    try {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      // Check file type
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        throw new Error('Only JPEG and PNG files are allowed')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `og-image-${Date.now()}.${fileExt}`
      
      // Upload to Supabase storage with public bucket
      const { data, error: uploadError } = await supabase.storage
        .from('og-images')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      if (!data) throw new Error('No data returned from upload')

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('og-images')
        .getPublicUrl(`public/${fileName}`)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error instanceof Error ? error : new Error('Failed to upload image')
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-medium">Content Management</h1>
          </div>

          <Button 
            variant="ghost" 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              router.push('/login')
            }}
            className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-2"
          >
            <span>Logout</span>
            <LogOut className="w-4 h-4" />
          </Button>
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
                  <Label>OG Image</Label>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <Input
                            value={metadata.og_image || ''}
                            onChange={(e) => setMetadata(prev => ({ ...prev, og_image: e.target.value }))}
                            className="bg-zinc-800/30 border-zinc-700/50"
                            placeholder="Enter image URL"
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Direct URL or Google Drive link
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept="image/png,image/jpeg"
                            className="bg-zinc-800/30 border-zinc-700/50 file:bg-zinc-800 file:border-0 file:text-sm file:font-medium"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              
                              try {
                                setIsMetadataSaving(true) // Show loading state
                                const url = await uploadImage(file)
                                setMetadata(prev => ({ ...prev, og_image: url }))
                                // Optionally save metadata immediately after upload
                                await updateMetadata()
                              } catch (error) {
                                alert(error instanceof Error ? error.message : 'Failed to upload image')
                              } finally {
                                setIsMetadataSaving(false)
                              }
                            }}
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            Upload from device
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-zinc-800">
                      <div className="bg-zinc-900/50 px-3 py-2 border-b border-zinc-800">
                        <p className="text-xs text-muted-foreground">Preview (1200x630)</p>
                      </div>
                      <div className="aspect-[1200/630] relative bg-zinc-800/50">
                        <Image
                          src={metadata.og_image || 'https://shreyash.social/profile-fallback.png'}
                          alt="OG Image Preview"
                          width={1200}
                          height={630}
                          className="object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.src = 'https://shreyash.social/profile-fallback.png'
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <p className="text-sm font-medium">Image Requirements:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Dimensions: 1200x630 pixels</li>
                        <li>• Format: PNG or JPEG</li>
                        <li>• Max size: 5MB</li>
                        <li>• Upload directly or use URL</li>
                        <li>• Supports Google Drive links</li>
                        <li>• Will fallback to default if invalid</li>
                      </ul>
                    </div>
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
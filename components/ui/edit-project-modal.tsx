"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Loader2, Trash2, Upload, Link, Github, Check } from "lucide-react"
import { Project } from "@/types/project"
import Image from 'next/image'

interface EditProjectModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (project: Project) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function EditProjectModal({ project: initialProject, open, onOpenChange, onSave, onDelete }: EditProjectModalProps) {
  const [project, setProject] = useState(initialProject)
  const [isLoading, setIsLoading] = useState({ save: false, delete: false, upload: false })
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    onOpenChange(false)
  }

  const showSuccessAndClose = async () => {
    setShowSuccess(true)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Show success for 1s
    handleClose()
  }

  const handleSaveClick = async () => {
    setIsLoading(prev => ({ ...prev, save: true }))
    try {
      await onSave(project)
      await showSuccessAndClose()
    } catch (error) {
      alert('Failed to save project')
    } finally {
      setIsLoading(prev => ({ ...prev, save: false }))
    }
  }

  const handleDeleteClick = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return
    setIsLoading(prev => ({ ...prev, delete: true }))
    try {
      await onDelete(project.id)
      await showSuccessAndClose()
    } catch (error) {
      alert('Failed to delete project')
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(prev => ({ ...prev, upload: true }))
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${project.id}-${Date.now()}.${fileExt}`
      const { data } = await supabase.storage
        .from('project-images')
        .upload(fileName, file)

      if (!data) throw new Error('Upload failed')

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName)

      setProject(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      alert('Failed to upload image')
    } finally {
      setIsLoading(prev => ({ ...prev, upload: false }))
    }
  }

  const handleField = (field: keyof Project) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value
    if (field === 'github_url' || field === 'live_url') {
      if (value && !value.match(/^https?:\/\//)) {
        value = `https://${value}`
      }
    }
    setProject(prev => ({ ...prev, [field]: value }))
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-2xl bg-zinc-900/80 backdrop-blur-xl border-zinc-800/50 shadow-xl">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeInUp}
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  {initialProject.id === 0 ? 'Create Project' : 'Edit Project'}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-5 gap-6 py-4">
                {/* Left Column - Image */}
                <motion.div 
                  className="col-span-2 space-y-4"
                  variants={fadeInUp}
                  transition={{ delay: 0.1 }}
                >
                  <div 
                    className="relative aspect-[16/10] rounded-xl bg-zinc-800/50 backdrop-blur-sm overflow-hidden cursor-pointer group 
                              ring-offset-zinc-900 transition-all duration-300 hover:ring-2 hover:ring-zinc-600/50 hover:ring-offset-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AnimatePresence mode="wait">
                      {project.image_url ? (
                        <motion.div
                          key="image"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Image 
                            src={project.image_url} 
                            alt={project.title}
                            width={1920}
                            height={1080}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400"
                        >
                          {isLoading.upload ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6" />
                              <span className="text-sm">Click to upload image</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>

                  {/* Input fields with smooth transitions */}
                  <motion.div 
                    className="space-y-4"
                    variants={fadeInUp}
                    transition={{ delay: 0.2 }}
                  >
                    {/* Title and Date inputs remain same but with updated styling */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Project Title</label>
                      <Input
                        value={project.title}
                        onChange={handleField('title')}
                        className="bg-zinc-800/30 border-zinc-700/50 focus:border-zinc-500 focus:ring-zinc-500 transition-all duration-200
                                 backdrop-blur-sm rounded-lg"
                        placeholder="Enter project title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Date</label>
                      <Input
                        value={project.date}
                        onChange={handleField('date')}
                        className="bg-zinc-800/30 border-zinc-700/50 focus:border-zinc-500 focus:ring-zinc-500 transition-all duration-200
                                 backdrop-blur-sm rounded-lg"
                        placeholder="e.g., Present, 2024"
                      />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right Column - Details */}
                <motion.div 
                  className="col-span-3 space-y-4"
                  variants={fadeInUp}
                  transition={{ delay: 0.3 }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Description</label>
                    <Textarea
                      value={project.description}
                      onChange={handleField('description')}
                      rows={4}
                      className="bg-zinc-800/30 border-zinc-700/50 focus:border-zinc-500 focus:ring-zinc-500 transition-all duration-200
                               backdrop-blur-sm rounded-lg resize-none"
                      placeholder="Describe your project..."
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <h4 className="text-sm font-medium text-zinc-400">Project Links</h4>
                    
                    <div className="grid gap-4">
                      {/* URL inputs with icons */}
                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <Github className="h-4 w-4 text-zinc-500" />
                        </div>
                        <Input
                          value={project.github_url}
                          onChange={handleField('github_url')}
                          className="bg-zinc-800/30 border-zinc-700/50 pl-10 transition-all duration-200
                                   focus:border-zinc-500 focus:ring-zinc-500 backdrop-blur-sm rounded-lg"
                          placeholder="GitHub repository URL"
                        />
                      </motion.div>

                      <motion.div 
                        className="relative"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-y-0 left-3 flex items-center">
                          <Link className="h-4 w-4 text-zinc-500" />
                        </div>
                        <Input
                          value={project.live_url}
                          onChange={handleField('live_url')}
                          className="bg-zinc-800/30 border-zinc-700/50 pl-10 transition-all duration-200
                                   focus:border-zinc-500 focus:ring-zinc-500 backdrop-blur-sm rounded-lg"
                          placeholder="Live project URL"
                        />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <Separator className="bg-zinc-800/50" />

              {/* Success Overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="bg-green-500/20 p-3 rounded-full"
                    >
                      <Check className="w-8 h-8 text-green-500" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <motion.div 
                className="flex items-center justify-between pt-4"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="destructive"
                  onClick={handleDeleteClick}
                  disabled={isLoading.delete || initialProject.id === 0 || showSuccess}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all duration-200"
                >
                  {isLoading.delete ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleClose}
                    disabled={showSuccess}
                    className="border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveClick}
                    disabled={isLoading.save || showSuccess}
                    className="bg-white/10 hover:bg-white/20 text-white transition-all duration-200 backdrop-blur-sm"
                  >
                    {isLoading.save ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
} 
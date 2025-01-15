import { Card, CardContent } from "@/components/ui/card"
import Image from 'next/image'

interface ProjectCardProps {
  title: string
  date: string
  description: string
  imageUrl?: string
}

export function ProjectCard({ title, date, description, imageUrl }: ProjectCardProps) {
  return (
    <div className="border-t border-gray-800/50 pt-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-light">{title}</h2>
        <span className="text-gray-500 text-sm">{date}</span>
      </div>
      <Card className="bg-transparent border-0">
        <CardContent className="p-0">
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-900/50">
            {imageUrl ? (
              <Image 
                src={imageUrl} 
                alt={title}
                width={1920}
                height={1080}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        </CardContent>
      </Card>
      <p className="text-gray-400 mt-6 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
} 
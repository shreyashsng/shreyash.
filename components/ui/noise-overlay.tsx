"use client"

import { useEffect, useRef } from 'react'

export function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const createNoise = () => {
      const idata = ctx.createImageData(canvas.width, canvas.height)
      const buffer32 = new Uint32Array(idata.data.buffer)
      const len = buffer32.length

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.25) {
          buffer32[i] = 0x55ffffff
        }
      }

      ctx.putImageData(idata, 0, 0)
    }

    let animationId: number
    const loop = () => {
      animationId = requestAnimationFrame(loop)
      createNoise()
    }
    loop()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.15] mix-blend-overlay"
      aria-hidden="true"
    />
  )
} 
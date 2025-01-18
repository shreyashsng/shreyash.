"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        throw new Error("Invalid password")
      }

      router.push("/admin")
    } catch (error) {
      setError("Invalid password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-zinc-200">Admin Access</h2>
          <p className="text-sm text-zinc-400 mt-2">Enter password to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800"
              placeholder="Enter password"
              required
            />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-zinc-800 hover:bg-zinc-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Verifying..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  )
} 
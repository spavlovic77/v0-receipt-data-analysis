"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      onSuccess()
      onOpenChange(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Prihlásenie zlyhalo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    console.log("[v0] Demo login initiated")
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const DEMO_EMAIL = "demo@example.com"
      const DEMO_PASSWORD = "demo1234"

      console.log("[v0] Attempting demo login with:", DEMO_EMAIL)

      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (error) {
        console.error("[v0] Demo login error:", error)
        throw error
      }

      console.log("[v0] Demo login successful")
      onSuccess()
      onOpenChange(false)
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Demo login failed:", error)
      setError(error instanceof Error ? error.message : "Demo prihlásenie zlyhalo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prihlásenie</DialogTitle>
          <DialogDescription>Prihláste sa pre uloženie naskenovaných dokladov</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="vas@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Prihlasovanie..." : "Prihlásiť sa"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">alebo</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-transparent"
          onClick={handleDemoLogin}
          disabled={isLoading}
        >
          Prihlásiť sa ako Demo užívateľ
        </Button>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ensureUserWallet } from "@/app/actions/wallet-actions"
import { Loader2 } from "lucide-react"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Logging in user...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      if (data.user) {
        console.log("[v0] User logged in, creating wallet...")
        setIsCreatingWallet(true)
        const walletResult = await ensureUserWallet()

        if (!walletResult.success) {
          console.error("[v0] Failed to create wallet:", walletResult.error)
          throw new Error(`Prihlásenie úspešné, ale vytvorenie peňaženky zlyhalo: ${walletResult.error}`)
        }

        console.log("[v0] Wallet created/found:", walletResult.wallet?.address)
      }

      onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Prihlásenie zlyhalo")
    } finally {
      setIsLoading(false)
      setIsCreatingWallet(false)
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

      console.log("[v0] Logging in demo user...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (error) throw error

      if (data.user) {
        console.log("[v0] Demo user logged in, creating wallet...")
        setIsCreatingWallet(true)
        const walletResult = await ensureUserWallet()

        if (!walletResult.success) {
          console.error("[v0] Failed to create wallet:", walletResult.error)
          throw new Error(`Prihlásenie úspešné, ale vytvorenie peňaženky zlyhalo: ${walletResult.error}`)
        }

        console.log("[v0] Demo wallet created/found:", walletResult.wallet?.address)
      }

      onSuccess()
    } catch (error: unknown) {
      console.error("[v0] Demo login failed:", error)
      setError(error instanceof Error ? error.message : "Demo prihlásenie zlyhalo")
    } finally {
      setIsLoading(false)
      setIsCreatingWallet(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prihlásenie</DialogTitle>
          <DialogDescription>Prihláste sa pre prístup k vašej Coinbase peňaženke</DialogDescription>
        </DialogHeader>

        {isCreatingWallet && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Vytváram vašu peňaženku...</p>
              <p className="text-sm text-muted-foreground">Toto môže trvať niekoľko sekúnd</p>
            </div>
          </div>
        )}
        {/* </CHANGE> */}

        {!isCreatingWallet && (
          <>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

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
import { SocialLoginButtons } from "./social-login-buttons"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultMode?: "signin" | "signup"
}

export function AuthDialog({ open, onOpenChange, onSuccess, defaultMode = "signin" }: AuthDialogProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          },
        })
        if (error) throw error

        if (data.user) {
          setIsCreatingWallet(true)
          const walletResult = await ensureUserWallet()

          if (!walletResult.success) {
            throw new Error(`Registrácia úspešná, ale vytvorenie peňaženky zlyhalo: ${walletResult.error}`)
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        if (data.user) {
          setIsCreatingWallet(true)
          const walletResult = await ensureUserWallet()

          if (!walletResult.success) {
            throw new Error(`Prihlásenie úspešné, ale vytvorenie peňaženky zlyhalo: ${walletResult.error}`)
          }
        }
      }
      if (onSuccess) onSuccess()
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : mode === "signup" ? "Registrácia zlyhala" : "Prihlásenie zlyhalo",
      )
    } finally {
      setIsLoading(false)
      setIsCreatingWallet(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const DEMO_EMAIL = "demo@example.com"
      const DEMO_PASSWORD = "demo1234"

      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })

      if (error) throw error

      if (data.user) {
        setIsCreatingWallet(true)
        const walletResult = await ensureUserWallet()

        if (!walletResult.success) {
          throw new Error(`Prihlásenie úspešné, ale vytvorenie peňaženky zlyhalo: ${walletResult.error}`)
        }
      }

      if (onSuccess) onSuccess()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Demo prihlásenie zlyhalo")
    } finally {
      setIsLoading(false)
      setIsCreatingWallet(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {mode === "signup" ? "Vytvorte si účet" : "Vitajte späť"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Zaregistrujte sa a získajte svoju krypto peňaženku"
              : "Prihláste sa pre prístup k vašej peňaženke"}
          </DialogDescription>
        </DialogHeader>

        {isCreatingWallet ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Vytváram peňaženku...</p>
              <p className="text-sm text-muted-foreground">Prosím počkajte</p>
            </div>
          </div>
        ) : !showEmailLogin ? (
          <div className="space-y-4">
            <SocialLoginButtons
              onLoading={setIsLoading}
              onError={setError}
              onWalletCreating={setIsCreatingWallet}
              onSuccess={() => {
                onOpenChange(false)
                if (onSuccess) onSuccess()
              }}
            />

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Alebo</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowEmailLogin(true)}
              disabled={isLoading}
            >
              Pokračovať s emailom
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Demo prihlásenie
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {mode === "signup" ? "Registrovať sa" : "Prihlásiť"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="w-full"
              >
                {mode === "signup" ? "Mám už účet" : "Vytvoriť nový účet"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowEmailLogin(false)} className="w-full">
                ← Späť
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

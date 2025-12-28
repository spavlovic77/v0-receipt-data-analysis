"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ensureUserWallet } from "@/app/actions/wallet-actions"
import { Loader2, Mail, LogIn } from "lucide-react"
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
  const [creationStep, setCreationStep] = useState<"auth" | "wallet" | "complete">("auth")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setCreationStep("auth")

    console.log("[v0] Auth dialog: Starting email/password login", { mode })

    try {
      if (mode === "signup") {
        console.log("[v0] Auth dialog: Signing up user")
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          },
        })
        if (error) throw error

        console.log("[v0] Auth dialog: Signup successful", { userId: data.user?.id })

        if (data.user) {
          setCreationStep("wallet")
          console.log("[v0] Auth dialog: Calling ensureUserWallet for new user")
          const walletResult = await ensureUserWallet()

          console.log("[v0] Auth dialog: Wallet creation result:", walletResult)

          if (!walletResult.success) {
            throw new Error(walletResult.error || "Vytvorenie peňaženky zlyhalo")
          }

          setCreationStep("complete")
          console.log("[v0] Auth dialog: Signup and wallet creation complete")
          setTimeout(() => {
            onOpenChange(false)
            if (onSuccess) onSuccess()
          }, 1000)
        }
      } else {
        console.log("[v0] Auth dialog: Signing in user")
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        console.log("[v0] Auth dialog: Sign in successful", { userId: data.user?.id })

        if (data.user) {
          setCreationStep("wallet")
          console.log("[v0] Auth dialog: Calling ensureUserWallet for existing user")
          const walletResult = await ensureUserWallet()

          console.log("[v0] Auth dialog: Wallet creation result:", walletResult)

          if (!walletResult.success) {
            throw new Error(walletResult.error || "Vytvorenie peňaženky zlyhalo")
          }

          setCreationStep("complete")
          console.log("[v0] Auth dialog: Sign in and wallet check complete")
          setTimeout(() => {
            onOpenChange(false)
            if (onSuccess) onSuccess()
          }, 1000)
        }
      }
    } catch (error: unknown) {
      console.error("[v0] Auth dialog: Login error:", error)
      setError(
        error instanceof Error ? error.message : mode === "signup" ? "Registrácia zlyhala" : "Prihlásenie zlyhalo",
      )
      setCreationStep("auth")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    setCreationStep("auth")
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
        setCreationStep("wallet")
        const walletResult = await ensureUserWallet()

        if (!walletResult.success) {
          throw new Error(walletResult.error || "Vytvorenie peňaženky zlyhalo")
        }

        setCreationStep("complete")
        setTimeout(() => {
          onOpenChange(false)
          if (onSuccess) onSuccess()
        }, 1000)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Demo prihlásenie zlyhalo")
      setCreationStep("auth")
    } finally {
      setIsLoading(false)
    }
  }

  const getLoadingMessage = () => {
    switch (creationStep) {
      case "auth":
        return mode === "signup" ? "Vytváram účet..." : "Prihlasujem..."
      case "wallet":
        return "Vytváram krypto peňaženku..."
      case "complete":
        return "Hotovo!"
      default:
        return "Načítavam..."
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
              ? "Zaregistrujte sa a získajte svoju krypto peňaženku automaticky"
              : "Prihláste sa pre prístup k vašej peňaženke a dokladom"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">{getLoadingMessage()}</p>
              <p className="text-sm text-muted-foreground">
                {creationStep === "wallet" && "Toto môže trvať niekoľko sekúnd"}
              </p>

              {/* Progress indicator */}
              <div className="flex justify-center gap-2 pt-4">
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${creationStep === "auth" ? "bg-primary" : "bg-primary/30"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${creationStep === "wallet" ? "bg-primary" : "bg-primary/30"}`}
                />
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${creationStep === "complete" ? "bg-primary" : "bg-primary/30"}`}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Social login first */}
            <SocialLoginButtons
              onLoading={setIsLoading}
              onError={setError}
              onCreationStep={setCreationStep}
              onSuccess={() => {
                onOpenChange(false)
                if (onSuccess) onSuccess()
              }}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Alebo</span>
              </div>
            </div>

            {/* Email/password form always visible */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {mode === "signup" && <p className="text-xs text-muted-foreground">Minimálne 6 znakov</p>}
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
              )}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isLoading} className="w-full h-11 text-base font-medium">
                  <LogIn className="w-4 h-4 mr-2" />
                  {mode === "signup" ? "Registrovať sa" : "Prihlásiť sa"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                  className="w-full"
                >
                  {mode === "signup" ? "Už mám účet" : "Vytvoriť nový účet"}
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Alebo vyskúšajte</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base font-medium bg-transparent"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Demo účet
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

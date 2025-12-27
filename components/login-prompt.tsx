"use client"

import { useState } from "react"
import { LogIn, Sparkles } from "lucide-react"
import { AuthDialog } from "./auth-dialog"
import { Button } from "./ui/button"

export function LoginPrompt() {
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Prihlásenie
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Prihláste sa pre prístup k vašej peňaženke a ukladanie dokladov
            </p>
            <Button onClick={() => setShowAuthDialog(true)} size="lg" className="gap-2">
              <LogIn className="w-4 h-4" />
              Prihlásiť sa
            </Button>
          </div>
        </div>
      </div>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onSuccess={() => {
          setShowAuthDialog(false)
          window.location.reload() // Reload to show wallet
        }}
      />
    </>
  )
}

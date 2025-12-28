"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LogOut } from "lucide-react"
import { AuthDialog } from "@/components/auth-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HeaderAuthButtonsProps {
  isLoggedIn: boolean
  userEmail?: string | null
}

export function HeaderAuthButtons({ isLoggedIn, userEmail }: HeaderAuthButtonsProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  const handleSignIn = () => {
    setAuthMode("signin")
    setShowAuth(true)
  }

  const handleSignUp = () => {
    setAuthMode("signup")
    setShowAuth(true)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        {userEmail && <span className="text-sm text-muted-foreground hidden sm:inline">{userEmail}</span>}
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="ghost"
          size="sm"
          className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? "Odhlasujem..." : "Odhlásiť"}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={handleSignIn} variant="ghost" size="sm" className="gap-2">
          <LogIn className="w-4 h-4" />
          Prihlásiť
        </Button>
        <Button onClick={handleSignUp} variant="default" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Registrovať
        </Button>
      </div>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        defaultMode={authMode}
        onSuccess={() => {
          setShowAuth(false)
          router.refresh()
        }}
      />
    </>
  )
}

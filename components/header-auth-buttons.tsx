"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogIn, UserPlus, LogOut } from "lucide-react"
import { AuthDialog } from "@/components/auth-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HeaderAuthButtonsProps {
  isLoggedIn: boolean
}

export function HeaderAuthButtons({ isLoggedIn }: HeaderAuthButtonsProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  console.log("[v0] HeaderAuthButtons - isLoggedIn:", isLoggedIn)

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
    console.log("[v0] Logging out...")
    const supabase = createClient()
    await supabase.auth.signOut()
    console.log("[v0] Logged out, refreshing page...")
    router.refresh()
  }

  if (isLoggedIn) {
    return (
      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        variant="ghost"
        size="sm"
        className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {loggingOut ? "Logging out..." : "Logout"}
      </Button>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button onClick={handleSignIn} variant="ghost" size="sm" className="gap-2">
          <LogIn className="w-4 h-4" />
          Login
        </Button>
        <Button onClick={handleSignUp} variant="default" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Sign Up
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
      {/* </CHANGE> */}
    </>
  )
}

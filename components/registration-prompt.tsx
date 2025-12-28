"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Sparkles, ArrowRight, X } from "lucide-react"
import { AuthDialog } from "./auth-dialog"
import { useRouter } from "next/navigation"
import { saveScannedReceipt } from "@/app/actions/save-receipt"

interface RegistrationPromptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptData: {
    receiptId: string
    dic: string
    receipt: any
    dataString: string
    fileName: string
  } | null
}

export function RegistrationPrompt({ open, onOpenChange, receiptData }: RegistrationPromptProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleRegister = () => {
    setShowAuthDialog(true)
  }

  const handleSkip = () => {
    onOpenChange(false)
  }

  const handleAuthSuccess = async () => {
    setShowAuthDialog(false)

    // Save the scanned receipt after successful registration
    if (receiptData) {
      setIsSaving(true)
      try {
        const result = await saveScannedReceipt(receiptData.receiptId, receiptData.dic, receiptData.receipt)

        if (result.error && result.error !== "DUPLICATE") {
          console.error("[v0] Error saving receipt after registration:", result.error)
        }
      } catch (error) {
        console.error("[v0] Error saving receipt:", error)
      } finally {
        setIsSaving(false)
        onOpenChange(false)
        router.refresh()
      }
    } else {
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <>
      <Dialog open={open && !showAuthDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              Doklad naskenovaný!
              <Sparkles className="w-5 h-5 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Chcete si vytvoriť účet a uložiť tento doklad do svojej peňaženky?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">Výhody registrácie</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Automatické ukladanie dokladov
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Coinbase peňaženka pre KREDIT tokeny
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Zálohovanie a história nákupov
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={handleRegister} className="w-full gap-2 text-base" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Ukladám doklad...
                  </>
                ) : (
                  <>
                    Vytvoriť účet
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSkip}
                className="w-full gap-2 text-base bg-transparent"
                disabled={isSaving}
              >
                <X className="w-4 h-4" />
                Pokračovať bez účtu
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Bez účtu môžete doklad iba zobraziť, ale neuloží sa
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} mode="signup" />
    </>
  )
}

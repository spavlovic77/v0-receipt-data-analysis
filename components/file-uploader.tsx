"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { Upload, FileText, Sparkles, Database, QrCode, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchReceiptById } from "@/app/actions/fetch-receipt"
import { saveScannedReceipt } from "@/app/actions/save-receipt"
import { QrScanner } from "@/components/qr-scanner"
import { AuthDialog } from "@/components/auth-dialog"
import { DuplicateReceiptDialog } from "@/components/duplicate-receipt-dialog"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onUpload: (content: string) => void
}

const SAMPLE_FILES = [
  {
    id: "log",
    name: "log.txt",
    path: "/sample-log.txt",
    description: "Vzorový dataset (68 účteniek)",
    icon: Database,
  },
]

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [loadingSample, setLoadingSample] = useState<string | null>(null)
  const [draggingSample, setDraggingSample] = useState<string | null>(null)
  const [loadingReceipt, setLoadingReceipt] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [pendingReceipt, setPendingReceipt] = useState<{
    receiptId: string
    dic: string
    receipt: any
    dataString: string
    fileName: string
  } | null>(null)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateReceiptInfo, setDuplicateReceiptInfo] = useState<{
    receiptId: string
    scannedAt?: string
  } | null>(null)
  const [isProcessingAfterLogin, setIsProcessingAfterLogin] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      setUserEmail(user?.email || null)
    }
    checkAuth()
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name)
      const content = await file.text()
      onUpload(content)
    },
    [onUpload],
  )

  const loadSampleFile = useCallback(
    async (sample: (typeof SAMPLE_FILES)[0]) => {
      setLoadingSample(sample.id)
      try {
        const response = await fetch(sample.path)
        const content = await response.text()
        setFileName(sample.name)
        onUpload(content)
      } catch (error) {
        console.error("Failed to load sample file:", error)
      } finally {
        setLoadingSample(null)
      }
    },
    [onUpload],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const sampleId = e.dataTransfer.getData("sampleId")
      if (sampleId) {
        const sample = SAMPLE_FILES.find((s) => s.id === sampleId)
        if (sample) {
          await loadSampleFile(sample)
        }
        setDraggingSample(null)
        return
      }

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile, loadSampleFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleSampleDragStart = useCallback((e: React.DragEvent, sample: (typeof SAMPLE_FILES)[0]) => {
    e.dataTransfer.effectAllowed = "copy"
    e.dataTransfer.setData("sampleId", sample.id)
    setDraggingSample(sample.id)
  }, [])

  const handleSampleDragEnd = useCallback(() => {
    setDraggingSample(null)
  }, [])

  const handleQrScan = useCallback(
    async (receiptId: string) => {
      console.log("[v0] QR scan initiated, receiptId:", receiptId)
      setLoadingReceipt(true)

      try {
        if (!isAuthenticated) {
          console.log("[v0] User not authenticated, showing auth dialog")
          setShowAuthDialog(true)
          setLoadingReceipt(false)
          return
        }

        const receipts = await fetchReceiptById(receiptId.trim())
        console.log("[v0] Receipts from QR scan:", receipts)

        if (receipts.length === 0) {
          throw new Error("Doklad neobsahuje žiadne položky")
        }

        const receipt = receipts[0]
        const dic = receipt.cashRegisterCode || "unknown"

        console.log("[v0] User authenticated, saving receipt")
        const saveResult = await saveScannedReceipt(receiptId, dic, receipt)
        console.log("[v0] Save result:", saveResult)

        if (saveResult.error) {
          if (saveResult.error === "DUPLICATE") {
            console.log("[v0] Duplicate receipt detected")
            setDuplicateReceiptInfo({
              receiptId,
              scannedAt: saveResult.scannedAt,
            })
            setShowDuplicateDialog(true)
            setLoadingReceipt(false)
            return
          } else {
            console.error("[v0] Error saving receipt:", saveResult.error)
            alert(`Doklad bol načítaný, ale nepodarilo sa ho uložiť: ${saveResult.error}`)
            setLoadingReceipt(false)
            return
          }
        }

        console.log("[v0] Receipt saved successfully")

        // Convert to string format for onUpload
        const dataString = JSON.stringify({
          source: "api",
          receipts: receipts,
        })

        const fileName = `Doklad ${receiptId.substring(0, 15)}...`
        setFileName(fileName)
        onUpload(dataString)
      } catch (error) {
        console.error("[v0] Error fetching receipt:", error)
        alert(error instanceof Error ? error.message : "Nepodarilo sa načítať doklad")
      } finally {
        setLoadingReceipt(false)
      }
    },
    [onUpload, isAuthenticated],
  )

  const handleAuthSuccess = () => {
    window.location.reload()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserEmail(null)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {isProcessingAfterLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Spracovávam doklad...</p>
              <p className="text-sm text-muted-foreground">Ukladám a pripravujem kategorizáciu</p>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && userEmail && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Prihlásený ako</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Odhlásiť
          </Button>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-2">
            <QrCode className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Naskenujte QR kód z dokladu</h2>
          </div>

          <QrScanner onScan={handleQrScan} loading={loadingReceipt} variant="primary" />

          {loadingReceipt && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Načítavam doklad...</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">alebo nahrajte súbor</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 md:gap-6 p-6 md:p-10 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-card/30",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept=".xml,.txt,.log"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 group-hover:scale-105 transition-transform duration-300">
          {fileName ? (
            <>
              <FileText className="w-6 h-6 md:w-7 md:h-7 text-foreground/70" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-primary animate-pulse" />
            </>
          ) : (
            <Upload className="w-6 h-6 md:w-7 md:h-7 text-foreground/50 group-hover:text-foreground/70 transition-colors" />
          )}
        </div>

        <div className="text-center relative z-10">
          <p className="font-medium text-sm md:text-base mb-1">
            {fileName || (
              <>
                <span className="hidden sm:inline">Presuňte sem vzorový dataset</span>
                <span className="sm:hidden">Nahrať súbor</span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{fileName ? "Spracovávam..." : "TXT formát"}</p>
        </div>
      </div>

      {!fileName && (
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground text-center">Alebo vyskúšajte vzorový dataset:</div>
          <div className="flex justify-center">
            {SAMPLE_FILES.map((sample) => {
              const Icon = sample.icon
              const isLoading = loadingSample === sample.id
              const isDraggingThis = draggingSample === sample.id
              return (
                <button
                  key={sample.id}
                  onClick={() => loadSampleFile(sample)}
                  disabled={isLoading}
                  draggable={!isLoading}
                  onDragStart={(e) => handleSampleDragStart(e, sample)}
                  onDragEnd={handleSampleDragEnd}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-all duration-200",
                    isLoading && "opacity-50 cursor-wait",
                    isDraggingThis && "opacity-50 scale-95",
                    !isLoading && "cursor-move",
                  )}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{sample.name}</p>
                    <p className="text-xs text-muted-foreground">{sample.description}</p>
                  </div>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} />
      <DuplicateReceiptDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        receiptId={duplicateReceiptInfo?.receiptId || ""}
        scannedAt={duplicateReceiptInfo?.scannedAt}
      />
    </div>
  )
}

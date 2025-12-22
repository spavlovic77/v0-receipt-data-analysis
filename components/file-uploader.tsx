"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Upload, FileText, Sparkles, Database, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchReceiptById } from "@/app/actions/fetch-receipt"
import { QrScanner } from "@/components/qr-scanner"

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
      setLoadingReceipt(true)
      try {
        const receipts = await fetchReceiptById(receiptId.trim())
        console.log("[v0] Receipts from QR scan:", receipts)

        // Convert ParsedReceipt[] to string format for onUpload
        // We'll use a special marker to indicate this is from API
        const dataString = JSON.stringify({
          source: "api",
          receipts: receipts,
        })

        setFileName(`Doklad ${receiptId.substring(0, 15)}...`)
        onUpload(dataString)
      } catch (error) {
        console.error("[v0] Error fetching receipt:", error)
        alert(error instanceof Error ? error.message : "Nepodarilo sa načítať doklad")
      } finally {
        setLoadingReceipt(false)
      }
    },
    [onUpload],
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />

        <div className="relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 mb-2">
            <QrCode className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Naskenujte QR kód z dokladu</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
              Automatická analýza a kategorizácia položiek pomocou AI
            </p>
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
                <span className="hidden sm:inline">Presuňte sem eKasa súbor</span>
                <span className="sm:hidden">Nahrať súbor</span>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{fileName ? "Spracovávam..." : "XML, TXT alebo LOG formát"}</p>
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
    </div>
  )
}

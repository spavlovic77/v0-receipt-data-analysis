"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface QrScannerProps {
  onScan: (receiptId: string) => void
  loading?: boolean
  variant?: "default" | "primary"
}

export function QrScanner({ onScan, loading, variant = "default" }: QrScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()

        // Start scanning loop
        scanIntervalRef.current = setInterval(() => {
          scanQRCode()
        }, 500)
      }
    } catch (err) {
      console.error("[v0] Camera access error:", err)
      setError("Nepodarilo sa získať prístup ku kamere")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setIsScanning(false)
  }

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Use jsQR library to detect QR code
    try {
      // @ts-ignore - jsQR will be loaded dynamically
      const code = window.jsQR?.(imageData.data, imageData.width, imageData.height)

      if (code?.data) {
        console.log("[v0] QR Code detected:", code.data)
        stopScanning()
        onScan(code.data)
        setIsOpen(false)
      }
    } catch (err) {
      console.error("[v0] QR scan error:", err)
    }
  }

  useEffect(() => {
    if (isOpen && !isScanning) {
      // Load jsQR library dynamically
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        startScanning()
      }

      return () => {
        document.body.removeChild(script)
        stopScanning()
      }
    } else if (!isOpen) {
      stopScanning()
    }
  }, [isOpen])

  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          disabled={loading}
          className="gap-2 text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Načítavam...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Spustiť skenovanie</span>
            </>
          )}
        </Button>
      ) : (
        <Button onClick={() => setIsOpen(true)} variant="outline" size="icon" className="shrink-0">
          <Camera className="w-4 h-4" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Skenovať QR kód dokladu</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                  !
                </div>
                <div>{error}</div>
              </div>
            )}

            <div className="relative aspect-square bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 border-4 border-primary rounded-2xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ScanLine className="w-48 h-48 text-primary/50 animate-pulse" />
                    </div>
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                  </div>
                </div>
              )}

              {!isScanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="text-white text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-1">Inicializuje sa kamera</p>
                      <p className="text-sm text-white/70">Moment...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Nasmerujte kameru na QR kód z dokladu eKasa</p>
            </div>

            <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">
              Zrušiť
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useState, useCallback } from "react"
import { FileUploader } from "./file-uploader"
import { ItemsTable } from "./items-table"
import { CategoryStats } from "./category-stats"
import { AIBatchVisualization } from "./ai-batch-visualization"
import type { BatchInfo, SecondPassInfo } from "./batch-progress"
import { parseReceiptFile } from "@/app/actions/parse"
import type { CategorizedItem, ParsedReceipt, ReceiptItem } from "@/lib/types"
import { CATEGORIES, getSectorByCode } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { RotateCcw, CheckCircle, AlertCircle, Sparkles } from "lucide-react"

type ProcessingState = "idle" | "parsing" | "categorizing" | "complete" | "error"

export function ReceiptAnalyzer() {
  const [state, setState] = useState<ProcessingState>("idle")
  const [items, setItems] = useState<CategorizedItem[]>([])
  const [receipts, setReceipts] = useState<ParsedReceipt[]>([])
  const [error, setError] = useState<string | null>(null)
  const [processingTimeMs, setProcessingTimeMs] = useState<number>(0)

  const [batches, setBatches] = useState<BatchInfo[]>([])
  const [preCategorizedCount, setPreCategorizedCount] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [secondPass, setSecondPass] = useState<SecondPassInfo>({
    status: "idle",
    totalItems: 0,
    improvedItems: 0,
    totalBatches: 0,
    batches: [],
  })
  const [secondPassStartTime, setSecondPassStartTime] = useState<number>(0)

  const processCategorization = async (allItems: ReceiptItem[]) => {
    console.log("[v0] Starting categorization for", allItems.length, "items")
    const startTime = performance.now()

    try {
      const response = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: allItems, batchSize: 10 }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log("[v0] Stream finished")
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))
            console.log("[v0] Received event:", data.type)

            switch (data.type) {
              case "pre-categorize":
                setPreCategorizedCount(data.preCategorizedCount)
                break

              case "batches-created":
                setBatches(data.batches)
                break

              case "batch-start":
                setBatches((prev) => prev.map((b) => (b.id === data.batchId ? { ...b, status: "processing" } : b)))
                break

              case "batch-complete":
                setBatches((prev) =>
                  prev.map((b) => (b.id === data.batchId ? { ...b, status: "complete", timeMs: data.timeMs } : b)),
                )
                break

              case "second-pass-start":
                console.log("[v0] Second pass starting with", data.itemCount, "items in", data.totalBatches, "batches")
                setSecondPassStartTime(performance.now())
                const secondPassBatches: BatchInfo[] = []
                for (let i = 0; i < data.totalBatches; i++) {
                  secondPassBatches.push({
                    id: i,
                    itemCount: 0,
                    status: "pending",
                  })
                }
                setSecondPass({
                  status: "processing",
                  totalItems: data.itemCount,
                  improvedItems: 0,
                  totalBatches: data.totalBatches,
                  batches: secondPassBatches,
                })
                break

              case "second-pass-batch-start":
                console.log("[v0] Second pass batch", data.batchId + 1, "starting with", data.itemCount, "items")
                setSecondPass((prev) => ({
                  ...prev,
                  batches: prev.batches.map((b) =>
                    b.id === data.batchId ? { ...b, status: "processing", itemCount: data.itemCount } : b,
                  ),
                }))
                break

              case "second-pass-batch-complete":
                console.log("[v0] Second pass batch", data.batchId + 1, "complete. Improved:", data.improved)
                setSecondPass((prev) => ({
                  ...prev,
                  batches: prev.batches.map((b) =>
                    b.id === data.batchId ? { ...b, status: "complete", timeMs: data.timeMs } : b,
                  ),
                  improvedItems: prev.improvedItems + data.improved,
                }))
                break

              case "second-pass-complete":
                console.log("[v0] Second pass complete. Total improved:", data.improved)
                setSecondPass((prev) => ({
                  ...prev,
                  status: "complete",
                  improvedItems: data.improved,
                  timeMs: performance.now() - secondPassStartTime,
                }))
                break

              case "complete":
                const endTime = performance.now()
                setProcessingTimeMs(endTime - startTime)
                setItems(data.results)
                setState("complete")
                console.log("[v0] Categorization complete. Total time:", endTime - startTime, "ms")
                break

              case "error":
                throw new Error(data.message)
            }
          }
        }
      }
    } catch (error) {
      console.error("[v0] processCategorization error:", error)
      throw error
    }
  }

  const handleFileUpload = useCallback(async (content: string) => {
    try {
      setError(null)
      setState("parsing")
      setBatches([])
      setPreCategorizedCount(0)
      setSecondPass({ status: "idle", totalItems: 0, improvedItems: 0, totalBatches: 0, batches: [] })

      const parsedReceipts = await parseReceiptFile(content)
      setReceipts(parsedReceipts)

      const allItems = parsedReceipts.flatMap((r) => r.items)

      if (allItems.length === 0) {
        setError("V nahratom súbore sa nenašli žiadne položky. Skontrolujte formát súboru.")
        setState("error")
        return
      }

      setTotalItems(allItems.length)
      setState("categorizing")

      await processCategorization(allItems)
    } catch (err) {
      console.error("[v0] Processing error:", err)
      setError(err instanceof Error ? err.message : "Počas spracovania nastala chyba")
      setState("error")
    }
  }, [])

  const handleCategoryChange = useCallback((itemId: string, newCategory: string, newCategoryName: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const categoryDef = CATEGORIES.find((c) => c.code === newCategory)
          const sectorDef = categoryDef ? getSectorByCode(categoryDef.sector) : undefined
          return {
            ...item,
            category: newCategory as CategorizedItem["category"],
            categoryName: newCategoryName,
            sector: categoryDef?.sector || item.sector,
            sectorName: sectorDef?.name || item.sectorName,
            isManuallyEdited: true,
            confidence: 1,
            reasoning: "Manuálne upravené používateľom",
          }
        }
        return item
      }),
    )
  }, [])

  const handleReset = useCallback(() => {
    setState("idle")
    setItems([])
    setReceipts([])
    setError(null)
    setProcessingTimeMs(0)
    setBatches([])
    setPreCategorizedCount(0)
    setTotalItems(0)
    setSecondPass({ status: "idle", totalItems: 0, improvedItems: 0, totalBatches: 0, batches: [] })
  }, [])

  return (
    <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-6 max-w-7xl mx-auto">
      <header className="flex flex-col gap-3 pt-4 md:pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                <span className="hidden md:inline">Analyzátor dokladov</span>
                <span className="md:hidden">eKasa AI</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl leading-relaxed hidden sm:block">
              Automatická AI kategorizácia položiek z eKasa dokladov
            </p>
          </div>
          {state !== "idle" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2 self-start sm:self-auto bg-transparent"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Nový sken</span>
              <span className="sm:hidden">Nový sken</span>
            </Button>
          )}
        </div>
      </header>

      {state === "idle" && <FileUploader onUpload={handleFileUpload} />}

      {state === "parsing" && (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 gap-3 md:gap-4 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border">
          <div className="relative">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
          <p className="font-semibold text-base md:text-lg">Spracovávam údaje z dokladov</p>
          <p className="text-xs md:text-sm text-muted-foreground">Parsovanie XML štruktúry...</p>
        </div>
      )}

      {state === "categorizing" && (
        <div className="flex flex-col gap-4 md:gap-6">
          <AIBatchVisualization
            batches={batches}
            preCategorizedCount={preCategorizedCount}
            totalItems={totalItems}
            secondPass={secondPass}
          />
        </div>
      )}

      {state === "error" && error && (
        <div className="flex flex-col items-center justify-center py-10 md:py-16 gap-3 md:gap-4 border border-destructive/30 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/5 backdrop-blur-xl px-4">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 md:w-7 md:h-7 text-destructive" />
          </div>
          <div className="text-center max-w-md">
            <p className="text-destructive font-semibold text-base md:text-lg mb-1 md:mb-2">Chyba spracovania</p>
            <p className="text-xs md:text-sm text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="mt-2 text-sm bg-transparent">
            Skúsiť znova
          </Button>
        </div>
      )}

      {state === "complete" && items.length > 0 && (
        <div className="flex flex-col gap-4 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3 p-4 md:p-5 border border-green-500/30 rounded-2xl bg-gradient-to-r from-green-500/10 via-green-500/5 to-transparent backdrop-blur-xl">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-semibold">Úspešne kategorizované</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                <strong>{items.length}</strong> položiek z {receipts.length}{" "}
                {receipts.length === 1 ? "dokladu" : receipts.length < 5 ? "dokladov" : "dokladov"}
              </p>
            </div>
          </div>

          <CategoryStats items={items} processingTimeMs={processingTimeMs} />
          <ItemsTable items={items} onCategoryChange={handleCategoryChange} />
        </div>
      )}
    </div>
  )
}

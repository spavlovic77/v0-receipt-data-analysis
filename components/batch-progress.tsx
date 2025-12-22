"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Loader2, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type BatchStatus = "pending" | "processing" | "complete" | "error"

export interface BatchInfo {
  id: number
  itemCount: number
  status: BatchStatus
  timeMs?: number
}

export interface SecondPassInfo {
  status: "idle" | "processing" | "complete"
  totalItems: number
  improvedItems: number
  timeMs?: number
  totalBatches: number
  batches: BatchInfo[]
}

interface BatchProgressProps {
  batches: BatchInfo[]
  preCategorizedCount: number
  totalItems: number
  secondPass?: SecondPassInfo
}

export function BatchProgress({ batches, preCategorizedCount, totalItems, secondPass }: BatchProgressProps) {
  const completedBatches = batches.filter((b) => b.status === "complete").length
  const processingBatches = batches.filter((b) => b.status === "processing").length
  const totalBatches = batches.length

  const completedItems = batches.filter((b) => b.status === "complete").reduce((acc, b) => acc + b.itemCount, 0)

  const overallProgress = totalItems > 0 ? Math.round(((preCategorizedCount + completedItems) / totalItems) * 100) : 0

  const secondPassCompletedBatches = secondPass?.batches?.filter((b) => b.status === "complete").length || 0
  const secondPassProcessingBatches = secondPass?.batches?.filter((b) => b.status === "processing").length || 0

  return (
    <div className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 border rounded-lg bg-muted/30">
      {/* Overall Progress */}
      <div className="flex flex-col gap-1.5 md:gap-2">
        <div className="flex items-center justify-between text-xs md:text-sm">
          <span className="font-medium">Priebeh</span>
          <span className="text-muted-foreground">
            {preCategorizedCount + completedItems}/{totalItems} ({overallProgress}%)
          </span>
        </div>
        <Progress value={overallProgress} className="h-2 md:h-3" />
      </div>

      {/* Pre-categorized info */}
      {preCategorizedCount > 0 && (
        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
          <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
          <span>
            {preCategorizedCount} <span className="hidden sm:inline">položiek pravidlami</span>
            <span className="sm:hidden">pravidlami</span>
          </span>
        </div>
      )}

      {/* Batch Grid - First Pass */}
      {batches.length > 0 && (
        <div className="flex flex-col gap-1.5 md:gap-2">
          <p className="text-xs md:text-sm font-medium">
            <span className="hidden sm:inline">AI dávky (GPT-4o-mini): </span>
            <span className="sm:hidden">AI: </span>
            {completedBatches}/{totalBatches}
            {processingBatches > 0 && <span className="hidden sm:inline">, {processingBatches} paralelne</span>}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-2">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        </div>
      )}

      {secondPass && secondPass.status !== "idle" && (
        <div className="flex flex-col gap-2 md:gap-3 pt-2 md:pt-3 border-t">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium">
              <span className="hidden sm:inline">Pokročilá analýza (GPT-4o)</span>
              <span className="sm:hidden">GPT-4o</span>
            </span>
          </div>

          {secondPass.batches && secondPass.batches.length > 0 && (
            <div className="flex flex-col gap-1.5 md:gap-2">
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {secondPassCompletedBatches}/{secondPass.totalBatches}
                {secondPassProcessingBatches > 0 && (
                  <span className="hidden sm:inline">, {secondPassProcessingBatches} spracovávaných</span>
                )}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 md:gap-2">
                {secondPass.batches.map((batch) => (
                  <BatchCard key={`sp-${batch.id}`} batch={batch} isSecondPass />
                ))}
              </div>
            </div>
          )}

          {secondPass.status === "complete" && (
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500 flex-shrink-0" />
              <span>
                {secondPass.improvedItems}/{secondPass.totalItems}
                {secondPass.timeMs && (
                  <span className="hidden sm:inline"> ({(secondPass.timeMs / 1000).toFixed(1)}s)</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BatchCard({ batch, isSecondPass = false }: { batch: BatchInfo; isSecondPass?: boolean }) {
  const statusConfig = {
    pending: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      icon: <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />,
      label: "Čaká",
    },
    processing: {
      bg: isSecondPass ? "bg-amber-100 dark:bg-amber-950" : "bg-blue-100 dark:bg-blue-950",
      text: isSecondPass ? "text-amber-700 dark:text-amber-300" : "text-blue-700 dark:text-blue-300",
      icon: <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 animate-spin" />,
      label: "...",
    },
    complete: {
      bg: "bg-green-100 dark:bg-green-950",
      text: "text-green-700 dark:text-green-300",
      icon: <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />,
      label: "OK",
    },
    error: {
      bg: "bg-red-100 dark:bg-red-950",
      text: "text-red-700 dark:text-red-300",
      icon: null,
      label: "!",
    },
  }

  const config = statusConfig[batch.status]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-1.5 md:p-2 rounded-md border transition-all duration-300",
        config.bg,
        config.text,
      )}
    >
      <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-medium">
        {config.icon}
        <span>{batch.id + 1}</span>
      </div>
      {batch.status === "complete" && batch.timeMs && (
        <span className="text-[8px] md:text-[10px] opacity-60">{(batch.timeMs / 1000).toFixed(1)}s</span>
      )}
    </div>
  )
}

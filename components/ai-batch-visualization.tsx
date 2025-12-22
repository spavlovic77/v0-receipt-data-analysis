"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Zap, Brain, Network, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BatchInfo, SecondPassInfo } from "./batch-progress"

interface AIBatchVisualizationProps {
  batches: BatchInfo[]
  preCategorizedCount: number
  totalItems: number
  secondPass?: SecondPassInfo
}

export function AIBatchVisualization({
  batches,
  preCategorizedCount,
  totalItems,
  secondPass,
}: AIBatchVisualizationProps) {
  const completedBatches = batches.filter((b) => b.status === "complete").length
  const processingBatches = batches.filter((b) => b.status === "processing").length
  const completedItems = batches.filter((b) => b.status === "complete").reduce((acc, b) => acc + b.itemCount, 0)
  const overallProgress = totalItems > 0 ? Math.round(((preCategorizedCount + completedItems) / totalItems) * 100) : 0

  const secondPassCompletedBatches = secondPass?.batches?.filter((b) => b.status === "complete").length || 0
  const secondPassProcessingBatches = secondPass?.batches?.filter((b) => b.status === "processing").length || 0

  const hasProcessing = processingBatches > 0 || secondPassProcessingBatches > 0

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-xl">
      {/* Animated Neural Network Background */}
      {hasProcessing && <NeuralNetworkBackground />}

      <div className="relative z-10 p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Brain className={cn("w-6 h-6 text-primary", hasProcessing && "animate-pulse")} />
              </div>
              {hasProcessing && <div className="absolute inset-0 rounded-xl bg-primary/20 animate-ping" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Kategorizácia</h3>
              <p className="text-xs text-muted-foreground">Pokročilá AI analýza</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <div className="text-xs text-muted-foreground">
              {preCategorizedCount + completedItems}/{totalItems}
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <Progress value={overallProgress} className="h-3 bg-muted/50" />
          {preCategorizedCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span>{preCategorizedCount} kategorizovaných pravidlami</span>
            </div>
          )}
        </div>

        {/* First Pass - GPT-4o-mini */}
        {batches.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-sm">Fáza 1: GPT-4o-mini</div>
                  <div className="text-xs text-muted-foreground">Rýchla kategorizácia</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedBatches}/{batches.length} dávok
                {processingBatches > 0 && <span className="ml-2 text-blue-500">• {processingBatches} paralelne</span>}
              </div>
            </div>

            {/* Parallel Processing Grid */}
            <ParallelProcessingGrid batches={batches} color="blue" />
          </div>
        )}

        {/* Second Pass - GPT-4o */}
        {secondPass && secondPass.status !== "idle" && (
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Zap
                      className={cn("w-4 h-4 text-amber-500", secondPass.status === "processing" && "animate-pulse")}
                    />
                  </div>
                  {secondPass.status === "processing" && (
                    <div className="absolute inset-0 rounded-lg bg-amber-500/20 animate-ping" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">Fáza 2: GPT-4o</div>
                  <div className="text-xs text-muted-foreground">Pokročilá AI analýza</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {secondPassCompletedBatches}/{secondPass.totalBatches} dávok
                {secondPassProcessingBatches > 0 && (
                  <span className="ml-2 text-amber-500">• {secondPassProcessingBatches} paralelne</span>
                )}
              </div>
            </div>

            {secondPass.batches && secondPass.batches.length > 0 && (
              <ParallelProcessingGrid batches={secondPass.batches} color="amber" isAdvanced />
            )}

            {secondPass.status === "complete" && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  Vylepšených: {secondPass.improvedItems}/{secondPass.totalItems}
                </span>
                {secondPass.timeMs && (
                  <span className="text-muted-foreground ml-auto">({(secondPass.timeMs / 1000).toFixed(1)}s)</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Neural Network Animated Background
function NeuralNetworkBackground() {
  const [nodes, setNodes] = useState<Array<{ x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const generatedNodes = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setNodes(generatedNodes)
  }, [])

  return (
    <div className="absolute inset-0 opacity-20 overflow-hidden">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Connection Lines */}
        {nodes.map((node, i) =>
          nodes.slice(i + 1, i + 4).map((targetNode, j) => (
            <line
              key={`${i}-${j}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              className="animate-pulse"
              style={{
                animationDelay: `${node.delay}s`,
                animationDuration: "3s",
              }}
            />
          )),
        )}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <circle
            key={i}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="3"
            fill="var(--color-primary)"
            className="animate-pulse"
            style={{
              animationDelay: `${node.delay}s`,
              animationDuration: "2s",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// Parallel Processing Grid Component
function ParallelProcessingGrid({
  batches,
  color,
  isAdvanced = false,
}: {
  batches: BatchInfo[]
  color: "blue" | "amber"
  isAdvanced?: boolean
}) {
  const colorConfig = {
    blue: {
      processing: "bg-blue-500/20 border-blue-500/50 shadow-blue-500/20",
      complete: "bg-green-500/20 border-green-500/50",
      pending: "bg-muted/50 border-border",
      icon: "text-blue-500",
    },
    amber: {
      processing: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-amber-500/20",
      complete: "bg-green-500/20 border-green-500/50",
      pending: "bg-muted/50 border-border",
      icon: "text-amber-500",
    },
  }

  const config = colorConfig[color]

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {batches.map((batch) => (
        <BatchNode key={batch.id} batch={batch} config={config} isAdvanced={isAdvanced} />
      ))}
    </div>
  )
}

// Individual Batch Node
function BatchNode({
  batch,
  config,
  isAdvanced,
}: {
  batch: BatchInfo
  config: any
  isAdvanced: boolean
}) {
  return (
    <div
      className={cn(
        "relative aspect-square rounded-lg border-2 transition-all duration-500 flex flex-col items-center justify-center group",
        batch.status === "processing" && cn(config.processing, "shadow-lg animate-pulse"),
        batch.status === "complete" && config.complete,
        batch.status === "pending" && config.pending,
      )}
    >
      {/* Processing Animation */}
      {batch.status === "processing" && (
        <>
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent animate-spin-slow" />
          </div>
          <div className={cn("relative z-10", config.icon)}>
            <Network className="w-5 h-5 animate-pulse" />
          </div>
        </>
      )}

      {/* Complete State */}
      {batch.status === "complete" && (
        <div className="relative z-10">
          <CheckCircle className="w-5 h-5 text-green-500" />
          {batch.timeMs && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {(batch.timeMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {/* Pending State */}
      {batch.status === "pending" && (
        <div className="text-[10px] font-medium text-muted-foreground">{batch.id + 1}</div>
      )}

      {/* Batch Number Label */}
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold">
        {batch.id + 1}
      </div>

      {/* Advanced Badge */}
      {isAdvanced && batch.status === "complete" && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Zap className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  )
}

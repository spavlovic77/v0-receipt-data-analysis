"use client"

import { useMemo } from "react"
import type { CategorizedItem } from "@/lib/types"
import { CATEGORIES, SECTORS } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CategoryStatsProps {
  items: CategorizedItem[]
  processingTimeMs?: number
}

export function CategoryStats({ items, processingTimeMs }: CategoryStatsProps) {
  const stats = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        totalItems: 0,
        avgConfidence: 0,
        manualEdits: 0,
        lowConfidence: 0,
        sectorBreakdown: [],
        avgTimePerItem: 0,
        estimatedCostPerItem: 0,
        totalEstimatedCost: 0,
        aiCategorizedCount: 0,
      }
    }

    const avgConfidence = items.reduce((sum, item) => sum + (item.confidence || 0), 0) / items.length
    const manualEdits = items.filter((item) => item.isManuallyEdited).length
    const lowConfidence = items.filter((item) => item.confidence < 0.5 && !item.isManuallyEdited).length

    const aiCategorizedCount = items.filter((item) => !item.isManuallyEdited).length
    const avgTimePerItem = processingTimeMs && aiCategorizedCount > 0 ? processingTimeMs / aiCategorizedCount : 0

    const estimatedCostPerItem = aiCategorizedCount > 0 ? 150 * 0.00000015 + 50 * 0.0000006 : 0

    const sectorBreakdown = SECTORS.map((sector) => {
      const sectorItems = items.filter((item) => item.sector === sector.code)
      const sectorItemCount = sectorItems.length

      const sectorCategories = CATEGORIES.filter((cat) => cat.sector === sector.code)
        .map((cat) => {
          const categoryItems = items.filter((item) => item.category === cat.code)
          const categoryCount = categoryItems.length

          const percentage = sectorItemCount > 0 ? (categoryCount / sectorItemCount) * 100 : 0

          return {
            code: cat.code,
            name: cat.name,
            itemCount: categoryCount,
            percentage: percentage,
          }
        })
        .filter((c) => c.itemCount > 0)
        .sort((a, b) => b.itemCount - a.itemCount)

      const sectorPercentage = items.length > 0 ? (sectorItemCount / items.length) * 100 : 0

      return {
        code: sector.code,
        name: sector.name,
        itemCount: sectorItemCount,
        percentage: sectorPercentage,
        categories: sectorCategories,
      }
    })
      .filter((s) => s.itemCount > 0)
      .sort((a, b) => b.itemCount - a.itemCount)

    return {
      totalItems: items.length,
      avgConfidence,
      manualEdits,
      lowConfidence,
      sectorBreakdown,
      avgTimePerItem,
      estimatedCostPerItem,
      totalEstimatedCost: estimatedCostPerItem * aiCategorizedCount,
      aiCategorizedCount,
    }
  }, [items, processingTimeMs])

  if (stats.totalItems === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Žiadne dáta na zobrazenie</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Celkom položiek</span>
              <span className="sm:hidden">Položiek</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.totalItems}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Priemerná istota</span>
              <span className="sm:hidden">Istota</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">{Math.round(stats.avgConfidence * 100)}%</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Na kontrolu</span>
              <span className="sm:hidden">Kontrola</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">{stats.lowConfidence}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Čas / položka</span>
              <span className="sm:hidden">Čas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">
              {stats.avgTimePerItem > 0 ? `${Math.round(stats.avgTimePerItem)}ms` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Cena / položka</span>
              <span className="sm:hidden">Cena</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">
              {stats.estimatedCostPerItem > 0 ? `$${stats.estimatedCostPerItem.toFixed(5)}` : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-1 md:pb-2 p-3 md:p-6">
            <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
              <span className="hidden sm:inline">Náklady AI</span>
              <span className="sm:hidden">AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <p className="text-xl md:text-2xl font-bold">
              {stats.totalEstimatedCost > 0 ? `$${stats.totalEstimatedCost.toFixed(4)}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-sm md:text-base">
            <span className="hidden sm:inline">Rozdelenie podľa sektorov a kategórií</span>
            <span className="sm:hidden">Sektory</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="flex flex-col gap-4 md:gap-6">
            {stats.sectorBreakdown.map((sector) => (
              <div key={sector.code} className="flex flex-col gap-1.5 md:gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm md:text-base">{sector.name}</span>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {sector.itemCount} <span className="hidden sm:inline">položiek</span> (
                    {sector.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={sector.percentage} className="h-1.5 md:h-2" />

                {sector.categories.length > 0 && (
                  <div className="ml-2 md:ml-4 mt-1 md:mt-2 flex flex-col gap-1.5 md:gap-2 border-l-2 border-border/50 pl-2 md:pl-4">
                    {sector.categories.map((cat) => (
                      <div key={cat.code} className="flex flex-col gap-0.5 md:gap-1">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-muted-foreground truncate max-w-[150px] md:max-w-none">{cat.name}</span>
                          <span className="text-[10px] md:text-xs text-muted-foreground/70 flex-shrink-0 ml-2">
                            {cat.itemCount}
                          </span>
                        </div>
                        <Progress value={cat.percentage} className="h-1 md:h-1.5 opacity-70" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

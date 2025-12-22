"use client"

import { useCallback } from "react"
import type { CategorizedItem, ExportData } from "@/lib/types"
import { CATEGORIES } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileJson, FileSpreadsheet } from "lucide-react"

interface ExportPanelProps {
  items: CategorizedItem[]
}

export function ExportPanel({ items }: ExportPanelProps) {
  const generateExportData = useCallback((): ExportData => {
    const categorySummary = CATEGORIES.map((cat) => {
      const categoryItems = items.filter((item) => item.category === cat.code)
      return {
        category: cat.code,
        categoryName: cat.name,
        itemCount: categoryItems.length,
        totalValue: categoryItems.reduce((sum, item) => sum + item.totalPrice, 0),
      }
    }).filter((c) => c.itemCount > 0)

    return {
      generatedAt: new Date().toISOString(),
      totalItems: items.length,
      categorySummary,
      items,
    }
  }, [items])

  const downloadCSV = useCallback(() => {
    const headers = [
      "Názov položky",
      "Cena",
      "Množstvo",
      "Sadzba DPH",
      "Celková cena",
      "Kód kategórie",
      "Názov kategórie",
      "Istota",
      "Zdôvodnenie",
      "Manuálne upravené",
    ]

    const rows = items.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      item.price.toFixed(2),
      item.quantity,
      item.vatRate,
      item.totalPrice.toFixed(2),
      item.category,
      item.categoryName,
      Math.round(item.confidence * 100),
      `"${item.reasoning.replace(/"/g, '""')}"`,
      item.isManuallyEdited ? "Áno" : "Nie",
    ])

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kategorizacia-ucteniek-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [items])

  const downloadJSON = useCallback(() => {
    const data = generateExportData()
    const json = JSON.stringify(data, null, 2)

    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kategorizacia-ucteniek-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [generateExportData])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportovať výsledky
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={downloadCSV} className="gap-2 bg-transparent">
            <FileSpreadsheet className="w-4 h-4" />
            Stiahnuť CSV
          </Button>
          <Button variant="outline" onClick={downloadJSON} className="gap-2 bg-transparent">
            <FileJson className="w-4 h-4" />
            Stiahnuť JSON
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            Export obsahuje všetkých {items.length} kategorizovaných položiek s hodnotením istoty
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

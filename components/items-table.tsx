"use client"

import { useState, useMemo } from "react"
import type { CategorizedItem } from "@/lib/types"
import { CATEGORIES, SECTORS } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, Check } from "lucide-react"

interface ItemsTableProps {
  items: CategorizedItem[]
  onCategoryChange: (itemId: string, category: string, categoryName: string) => void
}

export function ItemsTable({ items, onCategoryChange }: ItemsTableProps) {
  const [search, setSearch] = useState("")
  const [filterSector, setFilterSector] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const filteredCategoriesForSelect = useMemo(() => {
    if (filterSector === "all") return CATEGORIES
    return CATEGORIES.filter((cat) => cat.sector === filterSector)
  }, [filterSector])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
      const matchesSector = filterSector === "all" || item.sector === filterSector
      const matchesCategory = filterCategory === "all" || item.category === filterCategory
      return matchesSearch && matchesSector && matchesCategory
    })
  }, [items, search, filterSector, filterCategory])

  const handleSectorChange = (value: string) => {
    setFilterSector(value)
    setFilterCategory("all")
  }

  const getConfidenceBadge = (confidence: number, isManual: boolean) => {
    if (isManual) {
      return (
        <Badge variant="outline" className="gap-1 text-[10px] md:text-xs bg-primary/10 text-primary border-primary/30">
          <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
          <span className="hidden sm:inline">Manuálne</span>
        </Badge>
      )
    }
    if (confidence >= 0.8) {
      return (
        <Badge variant="outline" className="text-[10px] md:text-xs bg-green-500/10 text-green-600 border-green-500/30">
          {Math.round(confidence * 100)}%
        </Badge>
      )
    }
    if (confidence >= 0.5) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] md:text-xs bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
        >
          {Math.round(confidence * 100)}%
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-[10px] md:text-xs bg-red-500/10 text-red-600 border-red-500/30">
        {Math.round(confidence * 100)}%
      </Badge>
    )
  }

  const getSectorName = (sectorCode: string) => {
    const sector = SECTORS.find((s) => s.code === sectorCode)
    return sector?.name || sectorCode
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">
              <span className="hidden sm:inline">Kategorizované položky</span>
              <span className="sm:hidden">Položky</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{filteredItems.length} výsledkov</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Vyhľadať..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-40 md:w-52 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-1 sm:flex-none">
            <Select value={filterSector} onValueChange={handleSectorChange}>
              <SelectTrigger className="flex-1 sm:w-32 md:w-44 bg-card/50 backdrop-blur-sm border-border/50 text-sm">
                <SelectValue placeholder="Sektor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky</SelectItem>
                {SECTORS.map((sector) => (
                  <SelectItem key={sector.code} value={sector.code}>
                    {sector.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="flex-1 sm:w-40 md:w-52 bg-card/50 backdrop-blur-sm border-border/50 text-sm">
                <SelectValue placeholder="Kategória" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky</SelectItem>
                {filteredCategoriesForSelect.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                <TableHead className="min-w-[150px] md:w-[300px] font-semibold text-xs md:text-sm">Názov</TableHead>
                <TableHead className="hidden sm:table-cell w-[120px] md:w-[150px] font-semibold text-xs md:text-sm">
                  Sektor
                </TableHead>
                <TableHead className="min-w-[140px] md:w-[200px] font-semibold text-xs md:text-sm">Kategória</TableHead>
                <TableHead className="w-[70px] md:w-[100px] font-semibold text-xs md:text-sm">
                  <span className="hidden sm:inline">Presnosť</span>
                  <span className="sm:hidden">%</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors border-border/30",
                    item.isManuallyEdited && "bg-primary/5",
                  )}
                >
                  <TableCell className="font-medium text-xs md:text-sm py-2 md:py-4">
                    <span className="line-clamp-2">{item.name}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell py-2 md:py-4">
                    <Badge variant="secondary" className="font-normal text-[10px] md:text-xs">
                      {getSectorName(item.sector)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 md:py-4">
                    <Select
                      value={item.category}
                      onValueChange={(value) => {
                        const cat = CATEGORIES.find((c) => c.code === value)
                        if (cat) {
                          onCategoryChange(item.id, value, cat.name)
                        }
                      }}
                    >
                      <SelectTrigger className="h-7 md:h-9 text-[10px] md:text-sm bg-card/50 border-border/50 hover:bg-card hover:border-primary/50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTORS.map((sector) => {
                          const sectorCategories = CATEGORIES.filter((cat) => cat.sector === sector.code)
                          if (sectorCategories.length === 0) return null
                          return (
                            <SelectGroup key={sector.code}>
                              <SelectLabel className="text-[10px] md:text-xs font-semibold text-muted-foreground">
                                {sector.name}
                              </SelectLabel>
                              {sectorCategories.map((cat) => (
                                <SelectItem key={cat.code} value={cat.code} className="text-xs md:text-sm">
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-2 md:py-4">
                    {getConfidenceBadge(item.confidence, item.isManuallyEdited)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DuplicateReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  receiptId: string
  scannedAt?: string
}

export function DuplicateReceiptDialog({ open, onOpenChange, receiptId, scannedAt }: DuplicateReceiptDialogProps) {
  const formattedDate = scannedAt
    ? new Date(scannedAt).toLocaleString("sk-SK", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-500" />
            </div>
            <DialogTitle className="text-xl">Doklad už naskenovaný</DialogTitle>
          </div>
          <DialogDescription className="text-base space-y-3">
            <p>Tento doklad ste už predtým naskenovali a je uložený v databáze.</p>
            {formattedDate && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium text-foreground mb-1">Prvé skenovanie:</p>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Každý doklad môže byť naskenovaný len raz, aby sa zabránilo duplicitám v systéme.
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={() => onOpenChange(false)} variant="default">
            Rozumiem
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

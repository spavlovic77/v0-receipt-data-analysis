"use server"

import type { ParsedReceipt, ReceiptItem } from "@/lib/types"

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export async function fetchReceiptById(receiptId: string): Promise<ParsedReceipt[]> {
  try {
    console.log("[v0] Fetching receipt with ID:", receiptId)

    const response = await fetch("https://ekasa.financnasprava.sk/mdu/api/v1/opd/receipt/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiptId: receiptId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] eKasa API error:", response.status, errorText)
      throw new Error(`eKasa API vrátila chybu: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Receipt data received:", JSON.stringify(data, null, 2))

    const items: ReceiptItem[] = []
    const receiptData = data.receipt || data

    if (receiptData.items && Array.isArray(receiptData.items)) {
      console.log("[v0] Found items array:", receiptData.items.length)
      for (const item of receiptData.items) {
        console.log("[v0] Processing item:", JSON.stringify(item, null, 2))
        items.push({
          id: generateId(),
          name: item.name || item.text || "Unknown",
          price: Number.parseFloat(item.price || "0") || 0,
          quantity: Number.parseFloat(item.quantity || "1") || 1,
          vatRate: Number.parseFloat(item.vatRate || item.vat || "0") || 0,
          itemType: item.itemType || "K",
          totalPrice: (Number.parseFloat(item.price || "0") || 0) * (Number.parseFloat(item.quantity || "1") || 1),
        })
      }
    }

    console.log("[v0] Parsed items from API:", items.length)

    if (items.length === 0) {
      throw new Error("Doklad neobsahuje žiadne položky")
    }

    const receipt: ParsedReceipt = {
      id: generateId(),
      receiptNumber: receiptData.receiptNumber || receiptData.receiptId,
      cashRegisterCode: receiptData.cashRegisterCode,
      timestamp: receiptData.createDate ? new Date(receiptData.createDate) : new Date(),
      items,
      totalAmount:
        Number.parseFloat(receiptData.totalPrice || receiptData.amount || "0") ||
        items.reduce((sum, item) => sum + item.totalPrice, 0),
      vatSummary: [],
    }

    return [receipt]
  } catch (error) {
    console.error("[v0] fetchReceiptById error:", error)
    throw new Error("Nepodarilo sa načítať doklad z eKasa API. Skontrolujte Receipt ID.")
  }
}

import type { ReceiptItem, ParsedReceipt } from "./types"

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function extractAttribute(attributeString: string, attributeName: string): string | null {
  // Match attribute="value" pattern (handles both single and double quotes)
  const regex = new RegExp(`${attributeName}=["']([^"']*)["']`, "i")
  const match = regex.exec(attributeString)
  return match ? match[1] : null
}

function parseApiResponse(content: string): ParsedReceipt[] | null {
  try {
    const parsed = JSON.parse(content)
    if (parsed.source === "api" && parsed.receipts && Array.isArray(parsed.receipts)) {
      console.log("[v0] Detected API response format with", parsed.receipts.length, "receipts")
      return parsed.receipts
    }
  } catch (e) {
    // Not JSON or not API format
  }
  return null
}

export function parseEkasaXml(xmlContent: string): ParsedReceipt[] {
  const receipts: ParsedReceipt[] = []

  // Find all ReceiptData blocks to count actual receipts
  const receiptDataRegex = /<(?:ekasa:|ns2:|v2:|)ReceiptData\s+([^>]*?)>[\s\S]*?<\/(?:ekasa:|ns2:|v2:|)ReceiptData>/gi

  let receiptMatch: RegExpExecArray | null

  console.log("[v0] Starting XML parsing...")
  console.log("[v0] Content length:", xmlContent.length)

  // Process each ReceiptData block as a separate receipt
  while ((receiptMatch = receiptDataRegex.exec(xmlContent)) !== null) {
    const receiptBlock = receiptMatch[0]
    const receiptAttributes = receiptMatch[1]

    // Extract receipt-level attributes
    const receiptNumber = extractAttribute(receiptAttributes, "ReceiptNumber")
    const cashRegisterCode = extractAttribute(receiptAttributes, "CashRegisterCode")
    const amount = extractAttribute(receiptAttributes, "Amount")
    const createDate = extractAttribute(receiptAttributes, "CreateDate")

    // Extract items from this receipt block
    const itemRegex = /<(?:ekasa:|ns2:|v2:|soap:|)Item\s+([^>]*?)\/>/gi
    const items: ReceiptItem[] = []

    let itemMatch: RegExpExecArray | null
    while ((itemMatch = itemRegex.exec(receiptBlock)) !== null) {
      const attributeString = itemMatch[1]

      const name = extractAttribute(attributeString, "Name")
      const price = extractAttribute(attributeString, "Price")
      const quantity = extractAttribute(attributeString, "Quantity")
      const vatRate = extractAttribute(attributeString, "VatRate")
      const itemType = extractAttribute(attributeString, "ItemType")

      if (name && price) {
        const priceNum = Number.parseFloat(price) || 0
        const quantityNum = Number.parseFloat(quantity || "1") || 1

        items.push({
          id: generateId(),
          name: name.trim(),
          price: priceNum,
          quantity: quantityNum,
          vatRate: Number.parseFloat(vatRate || "0") || 0,
          itemType: itemType || "K",
          totalPrice: priceNum * quantityNum,
        })
      }
    }

    if (items.length > 0) {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

      // Calculate VAT summary
      const vatMap = new Map<number, number>()
      items.forEach((item) => {
        const current = vatMap.get(item.vatRate) || 0
        vatMap.set(item.vatRate, current + item.totalPrice)
      })

      const vatSummary = Array.from(vatMap.entries()).map(([rate, amount]) => ({
        rate,
        amount,
      }))

      receipts.push({
        id: generateId(),
        receiptNumber: receiptNumber || undefined,
        cashRegisterCode: cashRegisterCode || undefined,
        timestamp: createDate ? new Date(createDate) : new Date(),
        items,
        totalAmount: Number.parseFloat(amount || "0") || totalAmount,
        vatSummary,
      })
    }
  }

  console.log("[v0] Total receipts found:", receipts.length)
  console.log(
    "[v0] Total items found:",
    receipts.reduce((sum, r) => sum + r.items.length, 0),
  )

  // Fallback: if no ReceiptData blocks found, try to extract items directly
  if (receipts.length === 0) {
    console.log("[v0] No ReceiptData blocks found, trying direct item extraction...")
    const items: ReceiptItem[] = []
    const itemRegex = /<(?:ekasa:|ns2:|v2:|soap:|)Item\s+([^>]*?)\/>/gi

    let match: RegExpExecArray | null
    while ((match = itemRegex.exec(xmlContent)) !== null) {
      const attributeString = match[1]

      const name = extractAttribute(attributeString, "Name")
      const price = extractAttribute(attributeString, "Price")
      const quantity = extractAttribute(attributeString, "Quantity")
      const vatRate = extractAttribute(attributeString, "VatRate")
      const itemType = extractAttribute(attributeString, "ItemType")

      if (name && price) {
        const priceNum = Number.parseFloat(price) || 0
        const quantityNum = Number.parseFloat(quantity || "1") || 1

        items.push({
          id: generateId(),
          name: name.trim(),
          price: priceNum,
          quantity: quantityNum,
          vatRate: Number.parseFloat(vatRate || "0") || 0,
          itemType: itemType || "K",
          totalPrice: priceNum * quantityNum,
        })
      }
    }

    console.log("[v0] Fallback: Total items found:", items.length)

    if (items.length > 0) {
      receipts.push({
        id: generateId(),
        timestamp: new Date(),
        items,
        totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
        vatSummary: [],
      })
    }
  }

  return receipts
}

// Parse plain text format (fallback for non-XML data)
export function parseTextFormat(content: string): ReceiptItem[] {
  const items: ReceiptItem[] = []
  const lines = content.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("//")) {
      items.push({
        id: generateId(),
        name: trimmed,
        price: 0,
        quantity: 1,
        vatRate: 0,
        itemType: "K",
        totalPrice: 0,
      })
    }
  }

  return items
}

// Main parser function that detects format
export function parseReceiptData(content: string): ParsedReceipt[] {
  const apiReceipts = parseApiResponse(content)
  if (apiReceipts) {
    return apiReceipts
  }

  if (content.includes("<") && content.includes(">")) {
    return parseEkasaXml(content)
  }

  const items = parseTextFormat(content)
  if (items.length > 0) {
    return [
      {
        id: generateId(),
        timestamp: new Date(),
        items,
        totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
        vatSummary: [],
      },
    ]
  }

  return []
}

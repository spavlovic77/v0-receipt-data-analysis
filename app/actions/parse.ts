"use server"

import { parseReceiptData } from "@/lib/parser"
import type { ParsedReceipt } from "@/lib/types"

export async function parseReceiptFile(content: string): Promise<ParsedReceipt[]> {
  return parseReceiptData(content)
}

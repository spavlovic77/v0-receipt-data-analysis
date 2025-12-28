import { ethers } from "ethers"

/**
 * Sign a receipt for KREDIT minting
 * Message format: {receiptId}:{name}:{surname}:{birthNumber}:{dic}:{amount}
 */
export async function signReceiptForKredit(
  receiptId: string,
  name: string,
  surname: string,
  birthNumber: string,
  dic: string,
  amount: bigint,
  signerPrivateKey: string,
): Promise<string> {
  // Construct the message
  const message = `${receiptId}:${name}:${surname}:${birthNumber}:${dic}:${amount.toString()}`

  console.log("[v0] Signing KREDIT message:", message)

  // Create wallet from private key
  const wallet = new ethers.Wallet(signerPrivateKey)

  // Create message hash
  const messageHash = ethers.keccak256(ethers.toUtf8Bytes(message))

  // Sign the message hash (this will add Ethereum prefix)
  const signature = await wallet.signMessage(ethers.getBytes(messageHash))

  console.log("[v0] KREDIT signature generated:", signature)

  return signature
}

/**
 * Convert EUR amount to token amount (18 decimals)
 * 1 EUR = 1 KREDIT token
 */
export function eurToTokenAmount(eurAmount: number): bigint {
  // Convert to smallest unit (18 decimals)
  const tokenAmount = ethers.parseEther(eurAmount.toString())
  return tokenAmount
}

/**
 * Convert token amount to EUR
 */
export function tokenAmountToEur(tokenAmount: bigint): number {
  const eurAmount = ethers.formatEther(tokenAmount)
  return Number.parseFloat(eurAmount)
}

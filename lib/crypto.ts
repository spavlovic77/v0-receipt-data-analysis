import { ethers } from "ethers"

export function generateKeyPair() {
  const wallet = ethers.Wallet.createRandom()
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.address,
  }
}

export function signMessage(message: string, privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey)
  const messageBytes = ethers.toUtf8Bytes(message)
  const messageHash = ethers.keccak256(messageBytes)
  const signature = wallet.signingKey.sign(messageHash)
  return signature.serialized
}

export function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const messageBytes = ethers.toUtf8Bytes(message)
    const messageHash = ethers.keccak256(messageBytes)
    const recoveredAddress = ethers.SigningKey.recoverPublicKey(messageHash, signature)
    const address = ethers.computeAddress(recoveredAddress)
    return address.toLowerCase() === expectedAddress.toLowerCase()
  } catch {
    return false
  }
}

export function getPublicKeyFromPrivateKey(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey)
  return wallet.address
}

import { ethers } from "ethers"

const KREDIT_ABI = [
  "function mintFromReceipt(string receiptId, string name, string surname, string birthNumber, string dic, uint256 amount, bytes signature) external",
  "function isReceiptMinted(string receiptId) external view returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function authorizedSigner() external view returns (address)",
  "event ReceiptMinted(address indexed user, string receiptId, uint256 amount, uint256 timestamp)",
]

export function getKreditContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const contractAddress = process.env.KREDIT_CONTRACT_ADDRESS
  if (!contractAddress) {
    throw new Error("KREDIT_CONTRACT_ADDRESS not set")
  }
  return new ethers.Contract(contractAddress, KREDIT_ABI, signerOrProvider)
}

export function getProvider() {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
  return new ethers.JsonRpcProvider(rpcUrl)
}

export function getSigner() {
  const privateKey = process.env.KREDIT_SIGNER_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("KREDIT_SIGNER_PRIVATE_KEY not set")
  }
  const provider = getProvider()
  return new ethers.Wallet(privateKey, provider)
}

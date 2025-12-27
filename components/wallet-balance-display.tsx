"use client"

import { useEffect, useState } from "react"
import { getUserWalletBalance } from "@/app/actions/get-wallet-balance"
import { Card } from "@/components/ui/card"
import { Wallet, TrendingUp, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WalletBalanceDisplay() {
  const [balance, setBalance] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [networkId, setNetworkId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBalance()
  }, [])

  const loadBalance = async () => {
    setLoading(true)
    const result = await getUserWalletBalance()

    if (result.success) {
      setBalance(result.balance)
      setAddress(result.address)
      setNetworkId(result.networkId)
    } else {
      setError(result.error || "Failed to load balance")
    }
    setLoading(false)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse" />
        <div className="relative p-6 space-y-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-12 w-48 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    )
  }

  if (error || !balance) {
    return null
  }

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background backdrop-blur-xl shadow-2xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />

      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Wallet Balance</p>
              <p className="text-xs text-muted-foreground/70">{networkId}</p>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>

        {/* Balance */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {Number.parseFloat(balance).toFixed(4)}
            </span>
            <span className="text-2xl font-semibold text-muted-foreground">ETH</span>
          </div>
          <p className="text-sm text-muted-foreground">≈ ${(Number.parseFloat(balance) * 2500).toFixed(2)} USD</p>
        </div>

        {/* Address */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
            <code className="text-sm font-mono text-foreground/90">{address && formatAddress(address)}</code>
          </div>
          <Button variant="ghost" size="sm" onClick={copyAddress} className="ml-2 h-8 w-8 p-0 hover:bg-primary/10">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </Card>
  )
}

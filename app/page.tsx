import { ReceiptAnalyzer } from "@/components/receipt-analyzer"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletBalanceDisplay } from "@/components/wallet-balance-display"
import { CreateWalletButton } from "@/components/create-wallet-button"
import { HeaderAuthButtons } from "@/components/header-auth-buttons"
import { LoginRefresher } from "@/components/login-refresher"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Page render - User logged in:", !!user)
  if (user) {
    console.log("[v0] User email:", user.email)
    console.log("[v0] User ID:", user.id)
  }

  let hasWallet = false
  if (user) {
    const { data: wallet } = await supabase.from("wallets").select("id").eq("user_id", user.id).single()

    hasWallet = !!wallet
    console.log("[v0] User has wallet:", hasWallet)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <LoginRefresher />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <HeaderAuthButtons isLoggedIn={!!user} />
        <a
          href="https://github.com/spavlovic77/v0-receipt-data-analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 hover:border-border hover:bg-card/90 transition-all duration-200 hover:scale-105 group"
          aria-label="GitHub Repository"
        >
          <svg
            className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        <ThemeToggle />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-8 max-w-4xl">
        {user && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
            Prihlásený ako: {user.email}
          </div>
        )}
        {!user && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
            Neprihlásený. Kliknite na Prihlásiť sa pre prihlásenie.
          </div>
        )}
        {user && !hasWallet && <CreateWalletButton />}
        {user && hasWallet && <WalletBalanceDisplay />}
      </div>

      <div className="relative">
        <ReceiptAnalyzer />
      </div>
    </main>
  )
}

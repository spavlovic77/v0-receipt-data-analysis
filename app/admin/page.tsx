"use client"

import { useState } from "react"
import { setupDemoUser } from "@/app/actions/setup-demo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)

    const res = await setupDemoUser()
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin: Setup Demo User</h1>
        <p className="text-muted-foreground mb-6">
          Click the button below to create/reset the demo user with proper authentication.
        </p>

        <Button onClick={handleSetup} disabled={loading}>
          {loading ? "Setting up..." : "Setup Demo User"}
        </Button>

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-muted">
            {result.success ? (
              <div className="text-green-600">
                <p className="font-semibold">✓ Demo user created successfully!</p>
                <p className="text-sm mt-2">Email: demo@example.com</p>
                <p className="text-sm">Password: demo1234</p>
                <p className="text-sm">User ID: {result.userId}</p>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-semibold">✗ Error creating demo user</p>
                <p className="text-sm mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin: Database Setup</h1>
        <p className="text-muted-foreground mb-6">
          To reset the database, run the SQL script in the Supabase SQL Editor.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Reset Database</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Run <code className="bg-background px-1 rounded">scripts/000_reset_database.sql</code> in Supabase SQL
              Editor to:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Drop all existing tables</li>
              <li>Create fresh users, wallets, and scanned_receipts tables</li>
              <li>Set up auto-user creation trigger</li>
            </ul>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

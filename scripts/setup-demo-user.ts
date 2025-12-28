"use server"

import { createClient } from "@supabase/supabase-js"

/**
 * Script to properly create demo user using Supabase Admin API
 * Run this once to set up the demo user with correct password hashing
 */
export async function setupDemoUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log("[v0] Setting up demo user...")

  try {
    // First, try to delete existing demo user if it exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingDemo = existingUsers?.users?.find((u) => u.email === "demo@example.com")

    if (existingDemo) {
      console.log("[v0] Deleting existing demo user...")
      await supabase.auth.admin.deleteUser(existingDemo.id)
    }

    // Create demo user with Supabase Admin API (proper password hashing)
    console.log("[v0] Creating new demo user...")
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "demo@example.com",
      password: "demo1234",
      email_confirm: true,
      user_metadata: {
        name: "Demo User",
      },
    })

    if (authError) {
      console.error("[v0] Error creating auth user:", authError)
      return { success: false, error: authError.message }
    }

    console.log("[v0] Demo user created in auth.users:", authData.user.id)

    // Ensure user exists in public.users table
    const { error: userError } = await supabase.from("users").upsert({
      id: authData.user.id,
      email: "demo@example.com",
    })

    if (userError) {
      console.error("[v0] Error creating public.users record:", userError)
    }

    console.log("[v0] Demo user setup complete!")
    return {
      success: true,
      userId: authData.user.id,
      email: "demo@example.com",
      password: "demo1234",
    }
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return { success: false, error: String(error) }
  }
}

"use server"

import { createClient } from "@supabase/supabase-js"

export async function setupDemoUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    console.log("[v0] Starting demo user setup...")

    // Delete existing demo user if exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingDemo = existingUsers?.users?.find((u) => u.email === "demo@example.com")

    if (existingDemo) {
      console.log("[v0] Deleting existing demo user:", existingDemo.id)
      await supabase.auth.admin.deleteUser(existingDemo.id)
    }

    console.log("[v0] Creating new demo user...")

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "demo@example.com",
      password: "demo1234",
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth error:", authError)
      throw authError
    }

    console.log("[v0] Demo user created in auth.users:", authData.user.id)

    const { error: usersError } = await supabase.from("users").upsert(
      {
        id: authData.user.id,
        email: "demo@example.com",
      },
      {
        onConflict: "id",
      },
    )

    if (usersError) {
      console.error("[v0] Error creating users record:", usersError)
      throw usersError
    }

    console.log("[v0] Created public.users record")

    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("[v0] Setup demo user error:", error.message)
    return { success: false, error: error.message }
  }
}

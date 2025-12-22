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
    // Delete existing demo user if exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingDemo = existingUsers?.users?.find((u) => u.email === "demo@example.com")

    if (existingDemo) {
      await supabase.auth.admin.deleteUser(existingDemo.id)
    }

    // Create demo user with proper password hashing
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "demo@example.com",
      password: "demo1234",
      email_confirm: true,
    })

    if (authError) throw authError

    // Create public.users record
    await supabase.from("users").upsert({
      id: authData.user.id,
      email: "demo@example.com",
    })

    // Create user profile
    await supabase.from("user_profiles").upsert({
      user_id: authData.user.id,
      name: "Adam",
      surname: "Smith",
      birth_number: "7711097383",
    })

    return { success: true, userId: authData.user.id }
  } catch (error: any) {
    console.error("[v0] Setup demo user error:", error)
    return { success: false, error: error.message }
  }
}

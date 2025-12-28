"use server"

import { createClient } from "@/lib/supabase/server"
import { generateRandomProfile } from "@/lib/random-profile"

export async function createUserProfile() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user exists in public.users
  const { data: existingUser } = await supabase.from("users").select("id").eq("id", user.id).single()

  // Create user in public.users if doesn't exist
  if (!existingUser) {
    const { error: userError } = await supabase.from("users").insert({ id: user.id, email: user.email! })

    if (userError && userError.code !== "23505") {
      // Ignore duplicate error
      console.error("[v0] Error creating user:", userError)
      return { success: false, error: userError.message }
    }
  }

  // Check if profile already exists
  const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("user_id", user.id).single()

  if (existingProfile) {
    return { success: true, profile: existingProfile }
  }

  // Generate random profile data
  const profileData = await generateRandomProfile()

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .insert({
      user_id: user.id,
      full_name: profileData.fullName,
      phone: profileData.phone,
      birth_date: profileData.birthDate,
    })
    .select()
    .single()

  if (profileError) {
    console.error("[v0] Error creating profile:", profileError)
    return { success: false, error: profileError.message }
  }

  return { success: true, profile }
}

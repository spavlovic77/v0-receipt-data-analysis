"use server"

import { createClient } from "@/lib/supabase/server"
import { generateRandomProfile } from "@/lib/random-profile"

export async function completeUserProfile() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("user_profiles").select("id").eq("user_id", user.id).single()

    if (existingProfile) {
      return { success: true, message: "Profile already exists" }
    }

    // Generate random profile data
    const profileData = await generateRandomProfile()

    // Insert profile
    const { error: insertError } = await supabase.from("user_profiles").insert({
      user_id: user.id,
      name: profileData.name,
      surname: profileData.surname,
      birth_number: profileData.birth_number,
    })

    if (insertError) {
      console.error("[v0] Error creating profile:", insertError)
      return { success: false, error: insertError.message }
    }

    console.log("[v0] Profile created successfully:", profileData)
    return { success: true, profile: profileData }
  } catch (error) {
    console.error("[v0] Error completing profile:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

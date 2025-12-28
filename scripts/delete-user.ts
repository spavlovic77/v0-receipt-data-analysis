import { createClient } from "@supabase/supabase-js"

// Run this script with: npx tsx scripts/delete-user.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function deleteUser(email: string) {
  try {
    console.log(`Looking for user with email: ${email}`)

    // Get user by email using admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      console.error("Error listing users:", listError)
      return
    }

    const user = users.users.find((u) => u.email === email)

    if (!user) {
      console.log(`User with email ${email} not found`)
      return
    }

    console.log(`Found user: ${user.id}`)

    // Delete related data first
    console.log("Deleting user's scanned receipts...")
    const { error: receiptsError } = await supabase.from("scanned_receipts").delete().eq("user_id", user.id)

    if (receiptsError) {
      console.error("Error deleting receipts:", receiptsError)
    }

    console.log("Deleting user's wallet...")
    const { error: walletError } = await supabase.from("wallets").delete().eq("user_id", user.id)

    if (walletError) {
      console.error("Error deleting wallet:", walletError)
    }

    console.log("Deleting user's profile...")
    const { error: profileError } = await supabase.from("user_profiles").delete().eq("user_id", user.id)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
    }

    // Delete user from auth
    console.log("Deleting user from auth...")
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("Error deleting user:", deleteError)
      return
    }

    console.log(`Successfully deleted user ${email}`)
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

// Delete the specified user
deleteUser("stanislav.pavlovic1@gmail.com")

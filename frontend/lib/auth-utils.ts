/**
 * Authentication utility functions
 */

import { createClient } from "@/lib/supabase/client"

export interface LoginCredentials {
  phone: string
}

export interface SignupData extends LoginCredentials {
  name?: string
  language?: string
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to send OTP" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." }
  }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOTP(
  phone: string,
  otp: string,
  userData?: any
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, userData }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Invalid OTP" }
    }

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to logout" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Network error. Please try again." }
  }
}

/**
 * Get current session
 */
export async function getSession() {
  try {
    const supabase = createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) throw error

    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error

    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

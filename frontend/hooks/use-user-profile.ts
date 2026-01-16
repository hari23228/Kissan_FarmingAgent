"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  language: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err as Error)
        console.error("Error fetching user profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, supabase])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) throw new Error("No user ID provided")

    try {
      // @ts-ignore - Bypassing Supabase type generation issues
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (err) {
      console.error("Error updating profile:", err)
      throw err
    }
  }

  return { profile, loading, error, updateProfile }
}

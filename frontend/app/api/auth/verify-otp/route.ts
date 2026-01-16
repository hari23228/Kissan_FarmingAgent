import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface UserProfile {
  id: string
  email: string
  phone: string | null
  name: string | null
  language: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user
 */
export async function POST(request: Request) {
  try {
    const { phone, otp, userData } = await request.json()

    // Validate required fields
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone}`,
      token: otp,
      type: 'sms',
    })

    if (error) {
      console.error('OTP verification error:', error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 401 })
    }

    // Check if user profile exists in users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    let profileSetup = false
    let userProfile: UserProfile | null = existingUser as UserProfile | null

    // If user doesn't exist or profile is incomplete, create/update it
    if (!existingUser || userError) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email || '',
          phone: phone.startsWith('+') ? phone : `+91${phone}`,
          name: userData?.name || null,
          language: userData?.language || 'en',
        } as any)
        .select()
        .maybeSingle()

      if (insertError) {
        console.error('Error creating user profile:', insertError)
      }
      userProfile = newUser as UserProfile | null
      profileSetup = false
    } else {
      const typedUser = existingUser as UserProfile
      // Check if profile is complete
      profileSetup = !!(typedUser.name && typedUser.phone)

      // Update user data if provided
      if (userData && Object.keys(userData).length > 0) {
        const updateData = {
          name: userData.name || typedUser.name,
          language: userData.language || typedUser.language,
        }
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          // @ts-expect-error - Type issue with Supabase generated types
          .update(updateData)
          .eq('id', data.user.id)
          .select()
          .maybeSingle()

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        } else {
          userProfile = updatedUser as UserProfile | null
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        email: data.user.email,
        name: userProfile?.name || userData?.name || null,
        language: userProfile?.language || userData?.language || 'en',
        profileSetup,
      },
      session: data.session,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'An error occurred during OTP verification' },
      { status: 500 }
    )
  }
}

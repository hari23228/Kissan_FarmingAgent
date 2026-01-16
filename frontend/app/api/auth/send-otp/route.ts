import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/send-otp
 * Send OTP to phone number for authentication
 */
export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    // Validate phone number
    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Valid phone number is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Use Supabase's signInWithOtp for phone authentication
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith('+') ? phone : `+91${phone}`, // Add country code if not present
    })

    if (error) {
      console.error('OTP send error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your phone',
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending OTP' },
      { status: 500 }
    )
  }
}

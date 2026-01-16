import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/auth/session
 * Get the current user session
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ session: null, user: null })
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({
      session,
      user: session.user,
      profile,
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching session' },
      { status: 500 }
    )
  }
}

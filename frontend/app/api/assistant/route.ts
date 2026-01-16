import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

/**
 * POST /api/assistant/query
 * Submit a query to the AI assistant
 */
export async function POST(request: Request) {
  try {
    const { query, language } = await request.json()

    // Validate required fields
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // TODO: Call AI model for response generation
    // For now, return mock response
    const mockResponse = `This is a sample response to your query about "${query}". In production, this would be replaced with an actual AI model response.`

    // Save to database
    const { data, error } = await supabase
      .from('assistant_queries')
      .insert({
        user_id: user.id,
        query,
        response: mockResponse,
        language: language || 'en',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    console.error('Assistant query error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing query' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/assistant/history
 * Get the user's assistant query history
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get the user's query history
    const { data, error } = await supabase
      .from('assistant_queries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ history: data })
  } catch (error) {
    console.error('Get assistant history error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching history' },
      { status: 500 }
    )
  }
}

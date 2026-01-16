import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

/**
 * POST /api/disease/diagnose
 * Submit a disease diagnosis query
 */
export async function POST(request: Request) {
  try {
    const { crop, symptoms, image_url } = await request.json()

    // Validate required fields
    if (!crop || !symptoms || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Crop and symptoms are required' },
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

    // TODO: Call AI model for disease diagnosis
    // For now, return mock data
    const mockDiagnosis = {
      diagnosis: 'Leaf Blight',
      confidence: 85.5,
      treatment:
        'Apply fungicide spray. Remove affected leaves. Ensure proper drainage.',
    }

    // Save to database
    const { data, error } = await supabase
      .from('disease_history')
      .insert({
        user_id: user.id,
        crop,
        symptoms,
        diagnosis: mockDiagnosis.diagnosis,
        confidence: mockDiagnosis.confidence,
        treatment: mockDiagnosis.treatment,
        image_url,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    console.error('Disease diagnosis error:', error)
    return NextResponse.json(
      { error: 'An error occurred during diagnosis' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/disease/history
 * Get the user's disease diagnosis history
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

    // Get the user's disease history
    const { data, error } = await supabase
      .from('disease_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ history: data })
  } catch (error) {
    console.error('Get disease history error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching history' },
      { status: 500 }
    )
  }
}

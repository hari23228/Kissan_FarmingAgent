import { NextRequest, NextResponse } from 'next/server'
import { groqAiService } from '@/lib/services/groq-ai'
import { schemesApiService } from '@/lib/services/schemes-api'

/**
 * POST /api/schemes/recommend
 * Get personalized scheme recommendations using AI with REAL government data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_profile } = body

    if (!user_profile) {
      return NextResponse.json(
        { error: 'User profile is required' },
        { status: 400 }
      )
    }

    console.log('🎯 Recommendation request received for profile:', user_profile)

    // Fetch all available schemes from REAL external API
    console.log('📋 Fetching real schemes from external API...')
    const response = await schemesApiService.fetchSchemes({ limit: 100 })

    if (!response.success || response.data.length === 0) {
      console.error('❌ No schemes available from API')
      return NextResponse.json(
        { error: 'Unable to fetch schemes from government API. Please try again.' },
        { status: 503 }
      )
    }

    console.log(`✅ Got ${response.data.length} real schemes for analysis`)

    // Generate AI-powered recommendations using REAL scheme data
    console.log('🤖 Generating personalized recommendations with Groq AI...')
    const recommendations = await groqAiService.recommendSchemes(
      response.data,
      user_profile
    )

    console.log(`✅ Generated ${recommendations.length} personalized recommendations`)

    return NextResponse.json({
      success: true,
      recommendations,
      total_schemes: response.data.length,
      source: 'external_api_with_groq_ai',
    })
  } catch (error) {
    console.error('❌ Error generating scheme recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Please try again.' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { groqAiService } from '@/lib/services/groq-ai'
import { schemesApiService } from '@/lib/services/schemes-api'

/**
 * POST /api/schemes/compare
 * Compare multiple schemes using AI with REAL government data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheme_ids, user_context } = body

    if (!scheme_ids || !Array.isArray(scheme_ids) || scheme_ids.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 scheme IDs are required for comparison' },
        { status: 400 }
      )
    }

    console.log(`⚖️ Comparison request for schemes:`, scheme_ids)

    // Fetch all schemes from REAL external API and filter by IDs
    console.log('📋 Fetching real schemes from external API...')
    const response = await schemesApiService.fetchSchemes({ limit: 100 })

    if (!response.success) {
      console.error('❌ Failed to fetch schemes from API')
      return NextResponse.json(
        { error: 'Failed to fetch schemes from government API. Please try again.' },
        { status: 503 }
      )
    }

    const schemesToCompare = response.data.filter((scheme) =>
      scheme_ids.includes(scheme.id)
    )

    if (schemesToCompare.length < 2) {
      console.error('❌ Could not find enough schemes to compare')
      return NextResponse.json(
        { error: 'Could not find enough schemes to compare. Please try again.' },
        { status: 404 }
      )
    }

    console.log(`✅ Found ${schemesToCompare.length} schemes to compare`)

    // Generate AI comparison using REAL scheme data
    console.log('🤖 Generating AI-powered comparison with Groq...')
    const comparison = await groqAiService.compareSchemes(
      schemesToCompare,
      user_context
    )

    console.log('✅ AI comparison generated successfully')

    return NextResponse.json({
      success: true,
      comparison,
      schemes: schemesToCompare,
      source: 'external_api_with_groq_ai',
    })
  } catch (error) {
    console.error('❌ Error comparing schemes:', error)
    return NextResponse.json(
      { error: 'Failed to compare schemes. Please try again.' },
      { status: 500 }
    )
  }
}

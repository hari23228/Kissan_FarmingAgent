import { NextRequest, NextResponse } from 'next/server'
import { schemesApiService } from '@/lib/services/schemes-api'
import { groqAiService } from '@/lib/services/groq-ai'
import { createClient } from '@/lib/supabase/client'

/**
 * GET /api/schemes
 * Fetch government schemes from external API with AI-powered enhancements
 * Query params: category (optional), state (optional), search (optional), ai_summary (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const state = searchParams.get('state')
    const search = searchParams.get('search')
    const aiSummary = searchParams.get('ai_summary') === 'true'
    const language = (searchParams.get('language') || 'en') as 'en' | 'hi' | 'ta'
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('🔍 Schemes API Request:', { category, state, search, aiSummary, language, limit })

    // Fetch schemes from REAL external API
    console.log('📋 Fetching schemes from external API...')
    const response = await schemesApiService.fetchSchemes({
      category: category || undefined,
      state: state || undefined,
      search: search || undefined,
      limit,
    })

    if (!response.success) {
      // Fallback to Supabase if external API fails
      console.warn('⚠️ External API failed, falling back to Supabase:', response.error)
      return await fallbackToSupabase(language, category)
    }

    console.log(`✅ Successfully fetched ${response.data.length} schemes from external API`)

    // Generate AI summaries if requested (using REAL scheme data)
    let schemes = response.data
    if (aiSummary && schemes.length > 0) {
      console.log(`🤖 Generating AI summaries for ${Math.min(schemes.length, 10)} schemes...`)
      try {
        const schemesToEnhance = schemes.slice(0, 10)
        const enhancedSchemes = await Promise.all(
          schemesToEnhance.map(async (scheme) => {
            const summary = await groqAiService.generateSchemeSummary(scheme, language)
            return {
              ...scheme,
              ai_summary: summary,
            }
          })
        )
        
        // Combine enhanced and non-enhanced schemes
        schemes = [...enhancedSchemes, ...schemes.slice(10)]
        console.log('✅ AI summaries generated successfully')
      } catch (error) {
        console.error('❌ AI summary generation failed:', error)
        // Continue without AI summaries
      }
    }

    return NextResponse.json({
      success: true,
      data: schemes,  // Use 'data' for consistency
      schemes,        // Also include 'schemes' for backwards compatibility
      total: response.total,
      source: 'external_api',
      message: 'Data fetched from government API (data.gov.in)',
    })
  } catch (error) {
    console.error('❌ Error in schemes API route:', error)
    
    // Attempt fallback to Supabase
    const language = new URL(request.url).searchParams.get('language') || 'en'
    const category = new URL(request.url).searchParams.get('category')
    return await fallbackToSupabase(language, category)
  }
}

/**
 * POST /api/schemes
 * Ask questions about schemes using AI with REAL government data
 * Also handles scheme-specific AI explanations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, scheme, language = 'en', user_context } = body

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    console.log(`💬 AI Question received: "${question}"`)
    console.log(`🌐 Language: ${language}`)

    // If a specific scheme is provided, generate explanation for that scheme
    if (scheme) {
      console.log(`📋 Generating AI explanation for scheme: ${scheme.name}`)
      
      const answer = await groqAiService.generateSchemeExplanation(
        scheme,
        user_context,
        language as 'en' | 'hi' | 'ta'
      )

      return NextResponse.json({
        success: true,
        answer,
        scheme: scheme.name,
        source: 'groq_ai',
      })
    }

    // Fetch relevant schemes from REAL external API for context
    console.log('📋 Fetching real schemes from external API for context...')
    const response = await schemesApiService.fetchSchemes({ limit: 20 })

    let schemes = response.data
    if (!response.success || response.data.length === 0) {
      console.warn('⚠️ No schemes from external API, using fallback')
      schemes = []
    }

    console.log(`✅ Got ${schemes.length} real schemes for AI context`)

    // Generate AI answer using REAL scheme data
    console.log('🤖 Generating AI answer with Groq using real data...')
    const answer = await groqAiService.answerSchemeQuestion(
      question,
      schemes,
      language as 'en' | 'hi' | 'ta'
    )

    // Find relevant schemes mentioned in the answer
    const relevantSchemes = schemes
      .filter((s) =>
        answer.toLowerCase().includes((s.title || '').toLowerCase().substring(0, 20))
      )
      .slice(0, 3)

    console.log(`✅ AI answer generated successfully`)

    return NextResponse.json({
      success: true,
      answer,
      relevant_schemes: relevantSchemes,
      total_schemes_analyzed: schemes.length,
      source: 'external_api_with_groq_ai',
    })
  } catch (error) {
    console.error('❌ Error answering scheme question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process your question. Please try again.' },
      { status: 500 }
    )
  }
}

/**
 * Fallback to Supabase database if external API fails
 */
async function fallbackToSupabase(language: string, category: string | null) {
  try {
    const supabase = createClient()

    let query = supabase
      .from('schemes')
      .select('*')
      .eq('language', language)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      schemes: data || [],
      total: data?.length || 0,
      source: 'supabase_fallback',
      message: 'Using cached data due to external API unavailability',
    })
  } catch (error) {
    console.error('Fallback to Supabase also failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to fetch schemes. Please try again later.',
        schemes: [],
      },
      { status: 503 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { marketPricesApiService, INDIAN_STATES, CROPS, MANDIS_BY_STATE } from '@/lib/services/market-prices-api'
import Groq from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

/**
 * GET /api/prices
 * Get market prices for crops from real APIs
 * Query params: commodity, state, market
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const commodity = searchParams.get('commodity') || searchParams.get('crop')
    const state = searchParams.get('state')
    const market = searchParams.get('market')

    console.log('📊 Prices API Request:', { commodity, state, market })

    // If no params, return available options
    if (!commodity && !state) {
      return NextResponse.json({
        success: true,
        states: INDIAN_STATES,
        crops: CROPS,
        mandis: MANDIS_BY_STATE,
      })
    }

    // Fetch prices from API
    const result = await marketPricesApiService.fetchMandiPrices({
      commodity: commodity || 'Tomato',
      state: state || 'Tamil Nadu',
      markets: market ? [market] : undefined,
      limit: 50,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to fetch prices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.mandiPrices,
      total: result.mandiPrices.length,
      source: 'market_api',
    })
  } catch (error) {
    console.error('❌ Prices API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market prices' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/prices
 * Get comprehensive market analysis with AI recommendations
 * Body: { commodity, state, quantity, unit, markets }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commodity, state, quantity, unit = 'kg', generateAdvice = true } = body

    console.log('📊 Market Analysis Request:', { commodity, state, quantity, unit })

    if (!commodity || !state) {
      return NextResponse.json(
        { success: false, error: 'Commodity and state are required' },
        { status: 400 }
      )
    }

    // Fetch combined prices and analysis
    const result = await marketPricesApiService.getCombinedPricesAndAnalysis({
      commodity,
      state,
      quantity: parseInt(quantity) || 100,
      unit,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to analyze prices' },
        { status: 500 }
      )
    }

    let aiAdvice = null

    // Generate AI-powered selling advice if requested
    if (generateAdvice && groq) {
      try {
        aiAdvice = await generateSellingAdvice({
          commodity,
          state,
          quantity,
          unit,
          mandiPrices: result.mandiPrices,
          analysis: result.analysis,
        })
      } catch (aiError) {
        console.error('AI advice generation failed:', aiError)
      }
    }

    return NextResponse.json({
      success: true,
      mandiPrices: result.mandiPrices,
      analysis: result.analysis,
      aiAdvice,
      source: 'market_api',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Market Analysis Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze market prices' },
      { status: 500 }
    )
  }
}

/**
 * Generate AI-powered selling advice using Groq
 */
async function generateSellingAdvice(data: {
  commodity: string
  state: string
  quantity: number
  unit: string
  mandiPrices: any[]
  analysis: any
}): Promise<string> {
  if (!groq) return 'AI advice not available'
  
  const { commodity, state, quantity, unit, mandiPrices, analysis } = data

  const pricesContext = mandiPrices
    .slice(0, 5)
    .map(p => `- ${p.market}: Min ₹${p.min_price}, Modal ₹${p.modal_price}, Max ₹${p.max_price} (Trend: ${p.trend})`)
    .join('\n')

  const prompt = `You are an expert agricultural market advisor for Indian farmers. Based on the REAL market data below, provide specific selling advice.

MARKET DATA (Live from Government APIs):
Commodity: ${commodity}
State: ${state}
Quantity: ${quantity} ${unit}

Current Mandi Prices:
${pricesContext}

Price Analysis:
- Average Price: ₹${analysis.avgPrice}/quintal
- Price Range: ₹${analysis.minPrice} - ₹${analysis.maxPrice}
- Price Trend: ${analysis.trend} (${analysis.priceChange > 0 ? '+' : ''}${analysis.priceChange}%)
- System Recommendation: ${analysis.recommendation.replace('_', ' ')}

Based on this REAL data, provide:
1. Clear recommendation (Sell Now / Hold / Wait)
2. Best mandi to sell at and why
3. Expected earnings for ${quantity} ${unit}
4. 2-3 specific reasons based on the data

Keep response concise (4-5 sentences), practical, and farmer-friendly.`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 300,
  })

  return completion.choices[0]?.message?.content || 'Unable to generate advice.'
}

/**
 * Translation API Route
 * Backend endpoint for Azure Translator to keep API keys secure
 */

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY
const AZURE_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com'
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, texts, from, to } = body

    if (!AZURE_KEY) {
      return NextResponse.json(
        { error: 'Azure Translator not configured' },
        { status: 500 }
      )
    }

    // Handle batch translation
    if (texts && Array.isArray(texts)) {
      const translatedTexts = await translateBatch(texts, from, to)
      return NextResponse.json({ translatedTexts })
    }

    // Handle single translation
    if (text) {
      const translatedText = await translateSingle(text, from, to)
      return NextResponse.json({ translatedText })
    }

    return NextResponse.json(
      { error: 'Invalid request: text or texts required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function translateSingle(text: string, from: string = 'en', to: string): Promise<string> {
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`

  const response = await axios.post(
    url,
    [{ Text: text }],
    {
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY!,
        'Ocp-Apim-Subscription-Region': AZURE_REGION,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  )

  return response.data[0]?.translations[0]?.text || text
}

async function translateBatch(texts: string[], from: string = 'en', to: string): Promise<string[]> {
  const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`

  const requestBody = texts.map(text => ({ Text: text }))

  const response = await axios.post(
    url,
    requestBody,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY!,
        'Ocp-Apim-Subscription-Region': AZURE_REGION,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  )

  return response.data.map((item: any) => item.translations[0]?.text || '')
}

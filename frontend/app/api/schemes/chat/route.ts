import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Scheme {
  id: string
  name: string
  title?: string
  description: string
  eligibility: string
  benefits: string
  documents_required?: string
  category?: string
  state?: string
  department?: string
  ministry?: string
  last_updated?: string
  how_to_apply?: string
  link?: string
}

interface ChatRequest {
  scheme: Scheme
  userContext?: {
    state?: string
    crop_type?: string
    land_size?: string
  }
  language?: string
  messages: Message[]
  isInitial: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { scheme, userContext, language = 'english', messages, isInitial } = body

    if (!scheme) {
      return NextResponse.json(
        { error: 'Scheme information is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Build comprehensive scheme context
    const schemeContext = `
SCHEME INFORMATION:
Name: ${scheme.name}
Description: ${scheme.description}
Category: ${scheme.category || 'Not specified'}
State: ${scheme.state || 'All India'}
${scheme.ministry ? `Ministry/Department: ${scheme.ministry}` : ''}

ELIGIBILITY CRITERIA:
${scheme.eligibility}

BENEFITS:
${scheme.benefits}

${scheme.documents_required ? `REQUIRED DOCUMENTS:\n${scheme.documents_required}\n` : ''}
${scheme.how_to_apply ? `APPLICATION PROCESS:\n${scheme.how_to_apply}\n` : ''}
${scheme.link ? `OFFICIAL WEBSITE: ${scheme.link}\n` : ''}
    `.trim()

    // Build user context
    const userInfo = userContext ? `
USER PROFILE:
- State: ${userContext.state || 'Not provided'}
- Crop Type: ${userContext.crop_type || 'Not provided'}
- Land Size: ${userContext.land_size || 'Not provided'}
    `.trim() : ''

    // System prompt for conversational AI
    const systemPrompt = `You are a helpful agricultural assistant for Indian farmers. You are having a conversation about the following government scheme:

${schemeContext}

${userInfo}

YOUR ROLE:
- Help farmers understand this specific scheme in simple, easy-to-understand language
- Ask follow-up questions to understand their situation better
- Provide personalized guidance based on their specific context
- Explain eligibility criteria, application process, benefits, and required documents
- Be conversational, friendly, and supportive
- Keep responses concise (2-3 paragraphs maximum)
- Use simple language suitable for farmers with varying education levels
${language !== 'english' ? `- Respond in ${language}` : ''}

CONVERSATION STRATEGY:
${isInitial ? `
This is the start of the conversation. Introduce yourself briefly, mention the scheme name, and ask 1-2 relevant questions to understand their situation better. For example:
- Are they eligible based on their land size, crop type, or state?
- What specific aspect of the scheme are they interested in?
- Do they need help with the application process?
` : `
This is an ongoing conversation. Based on their previous messages:
- Answer their questions clearly and specifically
- Ask clarifying follow-up questions when needed
- Provide step-by-step guidance if they're ready to apply
- Highlight relevant benefits based on their situation
- Guide them toward taking action
`}

IMPORTANT GUIDELINES:
- Only discuss THIS specific scheme - don't recommend other schemes
- Base all information on the scheme details provided above
- If you don't have specific information, acknowledge it and suggest they check the official website
- Be encouraging and supportive
- Use bullet points and clear formatting when explaining steps or lists
- If they ask about eligibility, match their situation to the criteria provided
`

    // Build messages array for Groq
    const groqMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))
    ]

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9,
    })

    const response = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({
      success: true,
      response,
    })

  } catch (error) {
    console.error('❌ Error in scheme chat:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

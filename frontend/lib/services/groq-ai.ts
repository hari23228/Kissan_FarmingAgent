/**
 * Groq AI Service
 * Generates intelligent, contextual responses for schemes and subsidies
 * Uses Groq's fast LLM inference
 */

import Groq from 'groq-sdk'
import type { Scheme } from './schemes-api'

class GroqAiService {
  private groq: Groq | null = null
  private readonly model = 'llama-3.3-70b-versatile' // Fast and accurate model

  constructor() {
    const apiKey = process.env.GROQ_API_KEY
    if (apiKey) {
      this.groq = new Groq({ apiKey })
    } else {
      console.warn('GROQ_API_KEY not configured - AI features will be disabled')
    }
  }

  /**
   * Generate a user-friendly summary of a scheme
   */
  async generateSchemeSummary(scheme: Scheme, language: 'en' | 'hi' | 'ta' = 'en'): Promise<string> {
    if (!this.groq) {
      console.warn('Groq AI not configured, returning fallback summary')
      return this.getFallbackSummary(scheme)
    }

    try {
      const languageInstructions = {
        en: 'Respond in simple English suitable for Indian farmers.',
        hi: 'Respond in Hindi (Devanagari script) suitable for Indian farmers.',
        ta: 'Respond in Tamil suitable for Indian farmers.',
      }

      const prompt = `You are a helpful assistant for Indian farmers. Provide a clear, concise summary of this government scheme in 2-3 sentences. ${languageInstructions[language]}

Scheme Details (REAL DATA from Government API):
- Scheme Name: ${scheme.title}
- Description: ${scheme.description}
- Who Can Apply: ${scheme.eligibility}
- Benefits: ${scheme.benefits}
- State/Region: ${scheme.state || 'All India'}
- Category: ${scheme.category}

Provide ONLY a helpful summary suitable for farmers, no additional formatting. Focus on practical benefits and who should apply.`

      console.log(`Generating AI summary for: ${scheme.title}`)

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.3,
        max_tokens: 200,
      })

      const summary = completion.choices[0]?.message?.content || this.getFallbackSummary(scheme)
      console.log('AI summary generated successfully')
      return summary
    } catch (error) {
      console.error('Error generating scheme summary with Groq:', error)
      return this.getFallbackSummary(scheme)
    }
  }

  /**
   * Answer user questions about schemes
   */
  async answerSchemeQuestion(
    question: string,
    schemes: Scheme[],
    language: 'en' | 'hi' | 'ta' = 'en'
  ): Promise<string> {
    if (!this.groq) {
      console.warn('Groq AI not configured, returning fallback answer')
      return this.getFallbackAnswer(question, schemes)
    }

    try {
      const languageInstructions = {
        en: 'Respond in simple, clear English.',
        hi: 'Respond in Hindi (Devanagari script).',
        ta: 'Respond in Tamil.',
      }

      // Prepare context from REAL API schemes
      const schemesContext = schemes
        .slice(0, 5)
        .map((s, i) => `${i + 1}. ${s.title}
   - Category: ${s.category}
   - State: ${s.state || 'All India'}
   - Eligibility: ${s.eligibility.substring(0, 150)}
   - Benefits: ${s.benefits.substring(0, 150)}`)
        .join('\n\n')

      const prompt = `You are a helpful assistant for Indian farmers. Answer this question about government schemes and subsidies using the REAL government data provided below. ${languageInstructions[language]}

User Question: ${question}

Available Government Schemes (REAL DATA from data.gov.in):
${schemesContext}

Provide a helpful, accurate answer in 3-4 sentences. Focus on practical information. If the answer is in the schemes above, cite the specific scheme name. If not found in the schemes, provide general guidance about where to find such information.`

      console.log(`Generating AI answer for question: "${question}"`)
      console.log(`Using ${schemes.length} real schemes as context`)

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.4,
        max_tokens: 300,
      })

      const answer = completion.choices[0]?.message?.content || this.getFallbackAnswer(question, schemes)
      console.log('AI answer generated successfully')
      return answer
    } catch (error) {
      console.error('Error answering scheme question with Groq:', error)
      return this.getFallbackAnswer(question, schemes)
    }
  }

  /**
   * Compare multiple schemes and provide recommendations
   */
  async compareSchemes(schemes: Scheme[], userContext?: string): Promise<string> {
    if (!this.groq) {
      return this.getFallbackComparison(schemes)
    }

    try {
      const schemesInfo = schemes.map((s) => ({
        title: s.title,
        category: s.category,
        eligibility: s.eligibility,
        benefits: s.benefits,
      }))

      const prompt = `You are a helpful assistant for Indian farmers. Compare these government schemes and recommend the best option${userContext ? ` for a farmer who ${userContext}` : ''}.

Schemes:
${JSON.stringify(schemesInfo, null, 2)}

Provide:
1. A brief comparison (2-3 sentences)
2. Your recommendation with reasoning

Keep it simple and practical. Respond in English.`

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.5,
        max_tokens: 400,
      })

      return completion.choices[0]?.message?.content || this.getFallbackComparison(schemes)
    } catch (error) {
      console.error('Error comparing schemes:', error)
      return this.getFallbackComparison(schemes)
    }
  }

  /**
   * Generate detailed explanation for a specific scheme
   */
  async generateSchemeExplanation(
    scheme: any,
    userContext?: {
      state?: string
      crop_type?: string
      land_size?: string
    },
    language: 'en' | 'hi' | 'ta' = 'en'
  ): Promise<string> {
    if (!this.groq) {
      return this.getFallbackSchemeExplanation(scheme)
    }

    try {
      const languageInstructions = {
        en: 'Respond in simple English that any farmer can understand.',
        hi: 'Respond in Hindi (Devanagari script) that any farmer can understand.',
        ta: 'Respond in Tamil that any farmer can understand.',
      }

      const userInfo = userContext
        ? `\n\nFarmer's context:
- State: ${userContext.state || 'Not specified'}
- Main crop: ${userContext.crop_type || 'Not specified'}
- Land size: ${userContext.land_size || 'Not specified'}`
        : ''

      const prompt = `You are a helpful government scheme advisor for Indian farmers. ${languageInstructions[language]}

Explain this government scheme in detail:

Scheme Name: ${scheme.name || scheme.title}
Description: ${scheme.description}
Eligibility: ${scheme.eligibility}
Benefits: ${scheme.benefits}
${scheme.documents_required ? `Documents Required: ${scheme.documents_required}` : ''}
${scheme.how_to_apply ? `How to Apply: ${scheme.how_to_apply}` : ''}
${scheme.state ? `State: ${scheme.state}` : ''}
${scheme.category ? `Category: ${scheme.category}` : ''}
${userInfo}

Provide a helpful explanation that covers:
1. What this scheme offers in simple terms
2. Who should apply (eligibility in simple words)
3. Main benefits the farmer will get
4. How to apply step by step
5. Any tips or advice for the application

Keep the response concise (5-7 sentences) but informative. Make it practical and actionable for farmers.`

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.4,
        max_tokens: 500,
      })

      return completion.choices[0]?.message?.content || this.getFallbackSchemeExplanation(scheme)
    } catch (error) {
      console.error('Error generating scheme explanation:', error)
      return this.getFallbackSchemeExplanation(scheme)
    }
  }

  private getFallbackSchemeExplanation(scheme: any): string {
    return `**${scheme.name || scheme.title}**

This scheme provides: ${scheme.benefits?.substring(0, 200) || 'Various benefits for farmers'}

Who can apply: ${scheme.eligibility?.substring(0, 200) || 'Eligible farmers as per scheme guidelines'}

For more details, please visit your nearest agriculture office or the official government portal.`
  }

  /**
   * Generate personalized scheme recommendations
   */
  async recommendSchemes(
    allSchemes: Scheme[],
    userProfile: {
      state?: string
      farmSize?: string
      crops?: string[]
      interests?: string[]
    }
  ): Promise<{ scheme: Scheme; reason: string }[]> {
    if (!this.groq) {
      return this.getFallbackRecommendations(allSchemes)
    }

    try {
      // Filter relevant schemes
      let relevantSchemes = allSchemes

      if (userProfile.state) {
        relevantSchemes = relevantSchemes.filter(
          (s) => !s.state || s.state === userProfile.state || s.state === 'All India'
        )
      }

      const schemesInfo = relevantSchemes.slice(0, 10).map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        eligibility: s.eligibility.substring(0, 150),
        benefits: s.benefits.substring(0, 150),
      }))

      const prompt = `You are a helpful assistant for Indian farmers. Recommend the top 3 most relevant schemes from this list for a farmer with this profile:

Profile:
- State: ${userProfile.state || 'Any'}
- Farm Size: ${userProfile.farmSize || 'Any'}
- Crops: ${userProfile.crops?.join(', ') || 'Various'}
- Interests: ${userProfile.interests?.join(', ') || 'General farming'}

Available Schemes:
${JSON.stringify(schemesInfo, null, 2)}

Return ONLY a JSON array with this exact format:
[
  {"id": "scheme-id", "reason": "Brief reason why this is relevant"},
  ...
]`

      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: this.model,
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const response = completion.choices[0]?.message?.content
      if (!response) return this.getFallbackRecommendations(allSchemes)

      const recommendations = JSON.parse(response)
      const recommendationArray = recommendations.recommendations || recommendations

      return recommendationArray.map((rec: any) => ({
        scheme: relevantSchemes.find((s) => s.id === rec.id) || relevantSchemes[0],
        reason: rec.reason,
      }))
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return this.getFallbackRecommendations(allSchemes)
    }
  }

  // Fallback methods when AI is not available
  private getFallbackSummary(scheme: Scheme): string {
    return `${scheme.title}: ${scheme.description.substring(0, 150)}... Eligibility: ${scheme.eligibility.substring(0, 100)}`
  }

  private getFallbackAnswer(question: string, schemes: Scheme[]): string {
    if (schemes.length === 0) {
      return 'No schemes found matching your query. Please try different search terms or contact your local agriculture office.'
    }
    return `Based on available schemes, you may be interested in: ${schemes[0].title}. ${schemes[0].description.substring(0, 150)}...`
  }

  private getFallbackComparison(schemes: Scheme[]): string {
    return `Available schemes: ${schemes.map((s) => s.title).join(', ')}. Please review the details of each scheme to find the best fit for your needs.`
  }

  private getFallbackRecommendations(schemes: Scheme[]): { scheme: Scheme; reason: string }[] {
    return schemes.slice(0, 3).map((scheme) => ({
      scheme,
      reason: 'This scheme may be relevant based on your profile.',
    }))
  }
}

// Export singleton instance
export const groqAiService = new GroqAiService()

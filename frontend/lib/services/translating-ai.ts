/**
 * AI Service Wrapper with Translation
 * Handles translation of user inputs and AI responses
 */

import { azureTranslator, SupportedLanguage } from './azure-translator'
import { groqAiService } from './groq-ai'
import type { Scheme } from './schemes-api'

class TranslatingAiService {
  /**
   * Generate scheme summary in user's language
   */
  async generateSchemeSummary(scheme: Scheme, language: SupportedLanguage = 'en'): Promise<string> {
    // The Groq service already handles multi-language responses
    return groqAiService.generateSchemeSummary(scheme, language)
  }

  /**
   * Answer user questions with automatic translation
   * Translates user's question to English -> Groq AI -> Translate response to user's language
   */
  async answerQuestion(
    userQuestion: string,
    schemes: Scheme[],
    userLanguage: SupportedLanguage = 'en'
  ): Promise<string> {
    try {
      // Translate user question to English if needed
      let questionInEnglish = userQuestion
      if (userLanguage !== 'en') {
        console.log(`Translating user question from ${userLanguage} to English...`)
        questionInEnglish = await azureTranslator.translate({
          text: userQuestion,
          from: userLanguage,
          to: 'en',
        })
        console.log(`Translated question: ${questionInEnglish}`)
      }

      // Get AI response (in user's language directly from Groq)
      const response = await groqAiService.answerSchemeQuestion(questionInEnglish, schemes, userLanguage)
      
      return response
    } catch (error) {
      console.error('Error in translating AI service:', error)
      return 'Sorry, I encountered an error processing your question. Please try again.'
    }
  }

  /**
   * General farming assistant chat
   * Note: This function is currently disabled as the chat method is not implemented in groqAiService
   */
  async chat(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    userLanguage: SupportedLanguage = 'en'
  ): Promise<string> {
    try {
      // TODO: Implement chat functionality when groqAiService.chat is available
      // For now, return a basic response
      const message = 'Chat functionality is currently being developed. Please try the schemes search or disease detection features.'
      
      if (userLanguage !== 'en') {
        return azureTranslator.translate({
          text: message,
          from: 'en',
          to: userLanguage,
        })
      }
      
      return message
    } catch (error) {
      console.error('Error in chat translation:', error)
      
      // Return error message in user's language
      const errorMessage = 'Sorry, I encountered an error. Please try again.'
      if (userLanguage !== 'en') {
        return azureTranslator.translate({
          text: errorMessage,
          from: 'en',
          to: userLanguage,
        })
      }
      return errorMessage
    }
  }

  /**
   * Translate crop disease diagnosis
   */
  async translateDiagnosis(
    diagnosis: {
      disease: string
      confidence: number
      symptoms: string[]
      treatment: string
      prevention: string
    },
    toLanguage: SupportedLanguage
  ): Promise<{
    disease: string
    confidence: number
    symptoms: string[]
    treatment: string
    prevention: string
  }> {
    if (toLanguage === 'en') {
      return diagnosis
    }

    try {
      const [disease, symptoms, treatment, prevention] = await Promise.all([
        azureTranslator.translate({ text: diagnosis.disease, to: toLanguage }),
        azureTranslator.translateBatch(diagnosis.symptoms, 'en', toLanguage),
        azureTranslator.translate({ text: diagnosis.treatment, to: toLanguage }),
        azureTranslator.translate({ text: diagnosis.prevention, to: toLanguage }),
      ])

      return {
        disease,
        confidence: diagnosis.confidence,
        symptoms,
        treatment,
        prevention,
      }
    } catch (error) {
      console.error('Error translating diagnosis:', error)
      return diagnosis
    }
  }

  /**
   * Translate scheme details
   */
  async translateScheme(scheme: Scheme, toLanguage: SupportedLanguage): Promise<Scheme> {
    if (toLanguage === 'en') {
      return scheme
    }

    try {
      const [title, description, eligibility, benefits, howToApply] = await Promise.all([
        azureTranslator.translate({ text: scheme.title, to: toLanguage }),
        azureTranslator.translate({ text: scheme.description, to: toLanguage }),
        azureTranslator.translate({ text: scheme.eligibility, to: toLanguage }),
        azureTranslator.translate({ text: scheme.benefits, to: toLanguage }),
        azureTranslator.translate({ text: scheme.how_to_apply || '', to: toLanguage }),
      ])

      return {
        ...scheme,
        title,
        description,
        eligibility,
        benefits,
        how_to_apply: howToApply,
      }
    } catch (error) {
      console.error('Error translating scheme:', error)
      return scheme
    }
  }

  /**
   * Translate batch of schemes
   */
  async translateSchemes(schemes: Scheme[], toLanguage: SupportedLanguage): Promise<Scheme[]> {
    if (toLanguage === 'en') {
      return schemes
    }

    return Promise.all(schemes.map(scheme => this.translateScheme(scheme, toLanguage)))
  }

  /**
   * Translate any text to target language
   */
  async translateText(text: string, toLanguage: SupportedLanguage): Promise<string> {
    if (toLanguage === 'en' || !text) {
      return text
    }

    try {
      return await azureTranslator.translate({ text, to: toLanguage })
    } catch (error) {
      console.error('Error translating text:', error)
      return text
    }
  }

  /**
   * Translate batch of texts efficiently
   */
  async translateBatchTexts(texts: string[], toLanguage: SupportedLanguage): Promise<string[]> {
    if (toLanguage === 'en' || texts.length === 0) {
      return texts
    }

    try {
      return await azureTranslator.translateBatch(texts, 'en', toLanguage)
    } catch (error) {
      console.error('Error translating batch texts:', error)
      return texts
    }
  }
}

export const translatingAiService = new TranslatingAiService()


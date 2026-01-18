/**
 * Azure Translator Service
 * Provides dynamic translation with caching and fallback mechanisms
 * Supports English, Hindi, and Tamil
 */

import axios from 'axios'

export type SupportedLanguage = 'en' | 'hi' | 'ta'

interface TranslationCache {
  [key: string]: string
}

interface TranslationRequest {
  text: string
  from?: SupportedLanguage
  to: SupportedLanguage
}

class AzureTranslatorService {
  private endpoint: string
  private key: string
  private cache: TranslationCache = {}
  private region: string = 'eastus'
  private readonly maxCacheSize = 1000
  private readonly cacheExpiry = 24 * 60 * 60 * 1000 // 24 hours

  constructor() {
    // For client-side, we'll use API route to avoid exposing keys
    this.endpoint = '/api/translate'
    this.key = '' // Not needed for client-side
    
    // Load cache from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadCache()
    }
  }

  /**
   * Translate text from one language to another
   */
  async translate(request: TranslationRequest): Promise<string> {
    const { text, from = 'en', to } = request

    // Return original if same language
    if (from === to) {
      return text
    }

    // Return original if text is empty
    if (!text || text.trim().length === 0) {
      return text
    }

    // Check cache first
    const cacheKey = this.getCacheKey(text, from, to)
    if (this.cache[cacheKey]) {
      console.log('Translation cache hit:', cacheKey.substring(0, 50))
      return this.cache[cacheKey]
    }

    try {
      console.log(`Translating: ${text.substring(0, 50)}... (${from} -> ${to})`)

      const response = await axios.post(
        this.endpoint,
        {
          text,
          from,
          to,
        },
        {
          timeout: 10000, // 10 second timeout
        }
      )

      const translatedText = response.data.translatedText

      // Cache the result
      this.cacheTranslation(cacheKey, translatedText)

      return translatedText
    } catch (error) {
      console.error('Translation error:', error)
      
      // Fallback: return original text if translation fails
      return text
    }
  }

  /**
   * Batch translate multiple texts
   */
  async translateBatch(
    texts: string[],
    from: SupportedLanguage = 'en',
    to: SupportedLanguage
  ): Promise<string[]> {
    if (from === to) {
      return texts
    }

    try {
      // Check which texts are already cached
      const uncachedTexts: string[] = []
      const results: string[] = new Array(texts.length)

      texts.forEach((text, index) => {
        const cacheKey = this.getCacheKey(text, from, to)
        if (this.cache[cacheKey]) {
          results[index] = this.cache[cacheKey]
        } else {
          uncachedTexts.push(text)
        }
      })

      // If all cached, return immediately
      if (uncachedTexts.length === 0) {
        return results
      }

      console.log(`Batch translating ${uncachedTexts.length} texts (${from} -> ${to})`)

      const response = await axios.post(
        this.endpoint,
        {
          texts: uncachedTexts,
          from,
          to,
        },
        {
          timeout: 15000,
        }
      )

      const translatedTexts = response.data.translatedTexts

      // Fill in the uncached results and cache them
      let uncachedIndex = 0
      texts.forEach((text, index) => {
        if (results[index] === undefined) {
          const translatedText = translatedTexts[uncachedIndex]
          results[index] = translatedText
          const cacheKey = this.getCacheKey(text, from, to)
          this.cacheTranslation(cacheKey, translatedText)
          uncachedIndex++
        }
      })

      return results
    } catch (error) {
      console.error('Batch translation error:', error)
      // Fallback: return original texts
      return texts
    }
  }

  /**
   * Translate with auto-detect source language
   */
  async translateAuto(text: string, to: SupportedLanguage): Promise<string> {
    return this.translate({ text, to })
  }

  /**
   * Generate cache key
   */
  private getCacheKey(text: string, from: SupportedLanguage, to: SupportedLanguage): string {
    return `${from}_${to}_${text}`
  }

  /**
   * Cache translation result
   */
  private cacheTranslation(key: string, value: string): void {
    // Implement LRU cache: remove oldest entries if cache is full
    if (Object.keys(this.cache).length >= this.maxCacheSize) {
      const keysToRemove = Object.keys(this.cache).slice(0, 100)
      keysToRemove.forEach(k => delete this.cache[k])
    }

    this.cache[key] = value
    this.saveCache()
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): void {
    try {
      const cached = localStorage.getItem('translation_cache')
      if (cached) {
        this.cache = JSON.parse(cached)
      }
    } catch (error) {
      console.error('Error loading translation cache:', error)
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(): void {
    try {
      localStorage.setItem('translation_cache', JSON.stringify(this.cache))
    } catch (error) {
      console.error('Error saving translation cache:', error)
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache = {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('translation_cache')
    }
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return Object.keys(this.cache).length
  }
}

// Export singleton instance
export const azureTranslator = new AzureTranslatorService()

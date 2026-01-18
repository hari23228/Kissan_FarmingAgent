/**
 * Translation Middleware for Backend
 * Handles translation of API responses based on Accept-Language header
 */

const axios = require('axios')

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY
const AZURE_ENDPOINT = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com'
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION || 'eastus'

/**
 * Translate text using Azure Translator
 */
async function translateText(text, from = 'en', to = 'en') {
  if (from === to || !text || !AZURE_KEY) {
    return text
  }

  try {
    const url = `${AZURE_ENDPOINT}/translate?api-version=3.0&from=${from}&to=${to}`
    
    const response = await axios.post(
      url,
      [{ Text: text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_KEY,
          'Ocp-Apim-Subscription-Region': AZURE_REGION,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    )

    return response.data[0]?.translations[0]?.text || text
  } catch (error) {
    console.error('Backend translation error:', error.message)
    return text // Fallback to original
  }
}

/**
 * Middleware to translate response based on Accept-Language header
 */
function translationMiddleware(req, res, next) {
  const language = req.headers['accept-language'] || 'en'
  
  // Store original json method
  const originalJson = res.json.bind(res)
  
  // Override json method to translate response
  res.json = async function(data) {
    if (language === 'en' || !AZURE_KEY) {
      return originalJson(data)
    }

    try {
      // Recursively translate strings in the response
      const translatedData = await translateObject(data, language)
      return originalJson(translatedData)
    } catch (error) {
      console.error('Error translating response:', error)
      return originalJson(data) // Fallback to original
    }
  }
  
  next()
}

/**
 * Recursively translate object properties
 */
async function translateObject(obj, toLang) {
  if (typeof obj === 'string') {
    return await translateText(obj, 'en', toLang)
  }
  
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(item => translateObject(item, toLang)))
  }
  
  if (obj && typeof obj === 'object') {
    const result = {}
    const keys = Object.keys(obj)
    
    for (const key of keys) {
      // Skip certain fields that shouldn't be translated
      if (['id', 'email', 'phone', 'url', 'created_at', 'updated_at', 'image_url', 'avatar_url'].includes(key)) {
        result[key] = obj[key]
      } else {
        result[key] = await translateObject(obj[key], toLang)
      }
    }
    
    return result
  }
  
  return obj
}

/**
 * Get language from request
 */
function getLanguageFromRequest(req) {
  return req.headers['accept-language'] || 'en'
}

module.exports = {
  translationMiddleware,
  translateText,
  getLanguageFromRequest,
}

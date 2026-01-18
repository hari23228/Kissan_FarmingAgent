/**
 * Language Context and Provider
 * Manages application-wide language state with persistence
 */

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { azureTranslator, SupportedLanguage } from '@/lib/services/azure-translator'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => Promise<void>
  isChangingLanguage: boolean
  translate: (text: string, from?: SupportedLanguage) => Promise<string>
  translateBatch: (texts: string[], from?: SupportedLanguage) => Promise<string[]>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'kisan_app_language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en')
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Initialize language from localStorage or user profile
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)

        if (user?.id) {
          // Fetch user profile to get language preference
          const { data: profile } = await supabase
            .from('users')
            .select('language')
            .eq('id', user.id)
            .single() as { data: { language?: string } | null }

          if (profile?.language) {
            setLanguageState(profile.language as SupportedLanguage)
            localStorage.setItem(LANGUAGE_STORAGE_KEY, profile.language)
            return
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
        if (stored && ['en', 'hi', 'ta'].includes(stored)) {
          setLanguageState(stored as SupportedLanguage)
        }
      } catch (error) {
        console.error('Error initializing language:', error)
      }
    }

    initializeLanguage()
  }, [supabase])

  // Change language with persistence
  const setLanguage = useCallback(
    async (newLang: SupportedLanguage) => {
      if (newLang === language) return

      setIsChangingLanguage(true)

      try {
        // Update state
        setLanguageState(newLang)

        // Save to localStorage
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang)

        // Update user profile if logged in
        if (userId) {
          try {
            await supabase
              .from('users')
              // @ts-ignore - Supabase types are overly strict here
              .update({ 
                language: newLang, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', userId)
          } catch (dbError) {
            console.error('Error updating language in database:', dbError)
          }
        }

        // Small delay for smooth UI transition
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error) {
        console.error('Error changing language:', error)
      } finally {
        setIsChangingLanguage(false)
      }
    },
    [language, userId, supabase]
  )

  // Translate text to current language
  const translate = useCallback(
    async (text: string, from: SupportedLanguage = 'en'): Promise<string> => {
      if (language === 'en' && from === 'en') {
        return text
      }
      return azureTranslator.translate({ text, from, to: language })
    },
    [language]
  )

  // Translate multiple texts
  const translateBatch = useCallback(
    async (texts: string[], from: SupportedLanguage = 'en'): Promise<string[]> => {
      if (language === 'en' && from === 'en') {
        return texts
      }
      return azureTranslator.translateBatch(texts, from, language)
    },
    [language]
  )

  const value: LanguageContextType = {
    language,
    setLanguage,
    isChangingLanguage,
    translate,
    translateBatch,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

// Hook for translation
export function useTranslation() {
  const { language, translate, translateBatch, isChangingLanguage } = useLanguage()

  const t = useCallback(
    async (key: string, fallback?: string): Promise<string> => {
      const text = fallback || key
      if (language === 'en') return text
      return translate(text)
    },
    [language, translate]
  )

  const tBatch = useCallback(
    async (keys: string[]): Promise<string[]> => {
      if (language === 'en') return keys
      return translateBatch(keys)
    },
    [language, translateBatch]
  )

  return { t, tBatch, language, isChangingLanguage }
}

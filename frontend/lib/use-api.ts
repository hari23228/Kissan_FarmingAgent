/**
 * API Hook with Language Integration
 * Automatically sets language header for all API requests
 */

'use client'

import { useEffect } from 'react'
import { useLanguage } from './language-context'
import { api } from './api'

/**
 * Hook to sync API service with current language
 */
export function useApi() {
  const { language } = useLanguage()

  useEffect(() => {
    api.setLanguage(language)
  }, [language])

  return api
}

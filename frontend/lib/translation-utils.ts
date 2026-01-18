/**
 * Translation Utilities and Hooks
 * Provides advanced translation capabilities with caching
 */

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from './language-context'
import { SupportedLanguage } from './services/azure-translator'

/**
 * Hook for translating static text with caching
 */
export function useTranslatedText(text: string, from: SupportedLanguage = 'en'): string {
  const { language, translate } = useLanguage()
  const [translated, setTranslated] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    const doTranslate = async () => {
      if (language === from) {
        setTranslated(text)
        return
      }

      setIsLoading(true)
      try {
        const result = await translate(text, from)
        if (isMounted) {
          setTranslated(result)
        }
      } catch (error) {
        console.error('Translation error:', error)
        if (isMounted) {
          setTranslated(text) // Fallback to original
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    doTranslate()

    return () => {
      isMounted = false
    }
  }, [text, language, from, translate])

  return isLoading ? text : translated
}

/**
 * Hook for translating multiple texts at once
 */
export function useTranslatedTexts(texts: string[], from: SupportedLanguage = 'en'): string[] {
  const { language, translateBatch } = useLanguage()
  const [translated, setTranslated] = useState(texts)

  useEffect(() => {
    let isMounted = true

    const doTranslate = async () => {
      if (language === from) {
        setTranslated(texts)
        return
      }

      try {
        const results = await translateBatch(texts, from)
        if (isMounted) {
          setTranslated(results)
        }
      } catch (error) {
        console.error('Batch translation error:', error)
        if (isMounted) {
          setTranslated(texts) // Fallback to original
        }
      }
    }

    doTranslate()

    return () => {
      isMounted = false
    }
  }, [texts.join('|'), language, from, translateBatch])

  return translated
}

/**
 * Translation key definitions for the entire app
 * This ensures consistency and makes it easy to manage all text
 */
export const translationKeys = {
  // Common
  common: {
    continue: 'Continue',
    back: 'Back',
    cancel: 'Cancel',
    save: 'Save',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    close: 'Close',
  },

  // Language Selection
  language: {
    selectLanguage: 'Select Your Language',
    english: 'English',
    hindi: 'हिन्दी',
    tamil: 'தமிழ்',
    changeLanguage: 'Change Language',
  },

  // Authentication
  auth: {
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    phone: 'Phone Number',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    enterOTP: 'Enter OTP',
    verifyOTP: 'Verify OTP',
    forgotPassword: 'Forgot Password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    loginSuccess: 'Login successful!',
    signupSuccess: 'Account created successfully!',
    invalidCredentials: 'Invalid email or password',
    accountExists: 'Account already exists',
  },

  // Home & Navigation
  home: {
    greeting: 'Hello',
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    dashboard: 'Dashboard',
    welcome: 'Welcome to Kisan AI Assistant',
    subtitle: 'Your farming companion for better yields',
  },

  // Features
  features: {
    diseaseHelp: 'Crop Disease Help',
    diseaseSubtitle: 'Identify and treat crop diseases',
    marketPrices: 'Market Prices',
    pricesSubtitle: 'Check latest crop prices',
    govSchemes: 'Government Schemes',
    schemesSubtitle: 'Find subsidies and schemes',
    assistant: 'AI Assistant',
    assistantSubtitle: 'Get farming advice',
  },

  // Disease Detection
  disease: {
    takePicture: 'Take Picture',
    uploadPhoto: 'Upload Photo',
    selectCrop: 'Select Crop',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    diagnosis: 'Diagnosis',
    remedy: 'Recommended Treatment',
    prevention: 'Prevention Tips',
    noDiseaseDetected: 'No disease detected',
    healthyPlant: 'Your plant looks healthy!',
    selectImage: 'Please select an image first',
  },

  // Market Prices
  prices: {
    todayPrices: "Today's Prices",
    commodity: 'Commodity',
    price: 'Price',
    market: 'Market',
    date: 'Date',
    perQuintal: 'per Quintal',
    searchCommodity: 'Search commodity...',
    noResults: 'No results found',
  },

  // Government Schemes
  schemes: {
    browseSchemes: 'Browse Schemes',
    eligibility: 'Eligibility',
    benefits: 'Benefits',
    howToApply: 'How to Apply',
    documents: 'Required Documents',
    category: 'Category',
    state: 'State',
    askQuestion: 'Ask about schemes...',
    loading: 'Loading schemes...',
  },

  // Profile
  profile: {
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    profileUpdated: 'Profile updated successfully',
    updateFailed: 'Failed to update profile',
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    preferences: 'Preferences',
  },

  // Forms & Validation
  forms: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: "Passwords don't match",
    enterValue: 'Enter a value',
    selectOption: 'Select an option',
  },

  // Notifications
  notifications: {
    welcomeBack: 'Welcome back!',
    checkNotifications: 'Check your notifications',
    noNotifications: 'No new notifications',
    markAllRead: 'Mark all as read',
  },

  // Errors
  errors: {
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Please try again',
    networkError: 'Network error. Check your connection.',
    serverError: 'Server error. Please try again later.',
    notFound: 'Not found',
    unauthorized: 'Unauthorized access',
    sessionExpired: 'Session expired. Please login again.',
  },

  // AI Assistant
  assistant: {
    askAnything: 'Ask me anything about farming...',
    thinking: 'Thinking...',
    typeMessage: 'Type your message...',
    send: 'Send',
    clearChat: 'Clear Chat',
    startConversation: 'Start a conversation',
  },
}

/**
 * Get all translation keys as flat array for batch translation
 */
export function getAllTranslationTexts(): string[] {
  const texts: string[] = []
  
  const extract = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        texts.push(obj[key])
      } else if (typeof obj[key] === 'object') {
        extract(obj[key])
      }
    }
  }
  
  extract(translationKeys)
  return texts
}

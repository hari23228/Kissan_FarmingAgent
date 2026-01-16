/**
 * API service for frontend-backend communication with Supabase
 * This service provides methods for all API calls used in the app
 */

import { createClient } from './supabase/client'

class ApiService {
  private supabase = createClient()

  // ============================================
  // AUTH APIs
  // ============================================

  async signup(data: { email: string; password: string; name: string; phone: string; language: string }) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return await response.json()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async logout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      return await response.json()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user
  }

  // ============================================
  // PROFILE APIs
  // ============================================

  async getProfile() {
    try {
      const response = await fetch('/api/profile')
      return await response.json()
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  }

  async updateProfile(data: { name?: string; phone?: string; language?: string; avatar_url?: string }) {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // ============================================
  // DISEASE DETECTION APIs
  // ============================================

  async diagnoseCropDisease(data: { crop: string; symptoms: string[]; image_url?: string }) {
    try {
      const response = await fetch('/api/disease', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Disease diagnosis error:', error)
      throw error
    }
  }

  async getDiseaseHistory() {
    try {
      const response = await fetch('/api/disease')
      return await response.json()
    } catch (error) {
      console.error('Get disease history error:', error)
      throw error
    }
  }

  // ============================================
  // MARKET PRICES APIs
  // ============================================

  async getCurrentPrices(params: { crop?: string; state?: string; district?: string }) {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v != null) as [string, string][]
      ).toString()
      const response = await fetch(`/api/prices?${queryString}`)
      return await response.json()
    } catch (error) {
      console.error('Get prices error:', error)
      throw error
    }
  }

  // ============================================
  // GOVERNMENT SCHEMES APIs
  // ============================================

  async getSchemes(params: { language?: string; category?: string; search?: string; ai_summary?: boolean }) {
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)])
      ).toString()
      const response = await fetch(`/api/schemes?${queryString}`)
      return await response.json()
    } catch (error) {
      console.error('Get schemes error:', error)
      throw error
    }
  }

  async askSchemeQuestion(question: string, language: string = 'en', userProfile?: any) {
    try {
      const response = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language, user_profile: userProfile }),
      })
      return await response.json()
    } catch (error) {
      console.error('Ask scheme question error:', error)
      throw error
    }
  }

  async getSchemeRecommendations(userProfile: any) {
    try {
      const response = await fetch('/api/schemes/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile: userProfile }),
      })
      return await response.json()
    } catch (error) {
      console.error('Get scheme recommendations error:', error)
      throw error
    }
  }

  async compareSchemes(schemeIds: string[], userContext?: string) {
    try {
      const response = await fetch('/api/schemes/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheme_ids: schemeIds, user_context: userContext }),
      })
      return await response.json()
    } catch (error) {
      console.error('Compare schemes error:', error)
      throw error
    }
  }

  // ============================================
  // ASSISTANT APIs
  // ============================================

  async sendChatMessage(data: { query: string; language?: string }) {
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return await response.json()
    } catch (error) {
      console.error('Chat message error:', error)
      throw error
    }
  }

  async getAssistantHistory() {
    try {
      const response = await fetch('/api/assistant')
      return await response.json()
    } catch (error) {
      console.error('Get assistant history error:', error)
      throw error
    }
  }

  // ============================================
  // STORAGE APIs (for image uploads)
  // ============================================

  async uploadImage(file: File, bucket: string = 'disease-images') {
    try {
      const user = await this.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return { url: urlData.publicUrl, path: fileName }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }
}

export const api = new ApiService()

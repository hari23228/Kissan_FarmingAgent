/**
 * Complete Integration Example
 * Shows the full multilingual flow in action
 */

'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { useTranslatedText, translationKeys } from '@/lib/translation-utils'
import { translatingAiService } from '@/lib/services/translating-ai'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/language-switcher'

/**
 * This component demonstrates:
 * 1. Language selection integration
 * 2. Real-time translation of UI text
 * 3. API calls with language headers
 * 4. AI translation for user inputs
 */
export function MultilingualIntegrationDemo() {
  const { language, isChangingLanguage } = useLanguage()
  const [userMessage, setUserMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Translated UI text
  const titleText = useTranslatedText('Multilingual Demo')
  const currentLangText = useTranslatedText('Current Language')
  const askQuestionText = useTranslatedText(translationKeys.assistant.askAnything)
  const sendText = useTranslatedText(translationKeys.common.submit)
  const responseText = useTranslatedText('AI Response')

  // Example: AI Chat with Translation
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return

    setIsLoading(true)
    try {
      // User can type in their language (Hindi/Tamil/English)
      // AI will respond in the same language
      const response = await translatingAiService.chat(userMessage, [], language)
      setAiResponse(response)
    } catch (error) {
      console.error('Chat error:', error)
      setAiResponse('Error: Could not get response')
    } finally {
      setIsLoading(false)
    }
  }

  // Example: API call with language header
  const fetchDataInUserLanguage = async () => {
    const response = await fetch('/api/some-endpoint', {
      headers: {
        'Accept-Language': language,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    // Data will be in user's selected language
    return data
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{titleText}</h1>
            <p className="text-muted-foreground mt-2">
              {currentLangText}: <span className="font-bold">{language.toUpperCase()}</span>
            </p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Demo Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: UI Translation */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {useTranslatedText('UI Text Translation')}
            </h2>
            <div className="space-y-2 text-sm">
              <p>✅ {useTranslatedText(translationKeys.common.continue)}</p>
              <p>✅ {useTranslatedText(translationKeys.common.save)}</p>
              <p>✅ {useTranslatedText(translationKeys.common.loading)}</p>
              <p>✅ {useTranslatedText(translationKeys.auth.login)}</p>
              <p>✅ {useTranslatedText(translationKeys.features.diseaseHelp)}</p>
            </div>
          </Card>

          {/* Card 2: Form Elements */}
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {useTranslatedText('Form Elements')}
            </h2>
            <div className="space-y-3">
              <Input placeholder={useTranslatedText(translationKeys.auth.name)} />
              <Input placeholder={useTranslatedText(translationKeys.auth.email)} />
              <Input placeholder={useTranslatedText(translationKeys.auth.phone)} />
              <Button className="w-full">
                {useTranslatedText(translationKeys.common.submit)}
              </Button>
            </div>
          </Card>

          {/* Card 3: AI Chat */}
          <Card className="p-6 md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">
              {useTranslatedText('AI Chat with Translation')}
            </h2>
            <div className="space-y-4">
              <Input
                placeholder={askQuestionText}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !userMessage.trim()}
                className="w-full"
              >
                {isLoading ? useTranslatedText(translationKeys.common.loading) : sendText}
              </Button>
              {aiResponse && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">{responseText}:</p>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-semibold mb-3">
            {useTranslatedText('How It Works')}:
          </h3>
          <ul className="space-y-2 text-sm">
            <li>✅ All UI text automatically translated to {language.toUpperCase()}</li>
            <li>✅ You can type in {language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}</li>
            <li>✅ AI responds in {language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}</li>
            <li>✅ API calls include Accept-Language: {language}</li>
            <li>✅ Preferences saved across sessions</li>
            <li>✅ Switch language anytime using the dropdown above</li>
          </ul>
        </Card>

        {/* Loading State Demo */}
        {isChangingLanguage && (
          <Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200">
            <p className="text-center">
              🔄 {useTranslatedText(translationKeys.common.loading)}
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { Input } from "@/components/ui/input"
import { ChevronLeft, Mic, Send, Loader2 } from "lucide-react"
import { useState } from "react"

interface AssistantScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
}

interface Message {
  id: string
  type: "user" | "assistant"
  text: string
  loading?: boolean
}

export default function AssistantScreen({ language, user, onNavigate }: AssistantScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      text: "Namaste! I am Kisan AI, your farming assistant powered by real government data. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickSuggestions = [
    { text: "What subsidies are available for irrigation?", emoji: "💧" },
    { text: "Show me schemes for small farmers", emoji: "🌾" },
    { text: "Find government schemes in my state", emoji: "📋" },
  ]

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        text: input,
      }

      const loadingMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        text: "Processing your question with real government data...",
        loading: true,
      }

      setMessages((prev) => [...prev, userMessage, loadingMessage])
      setInput("")
      setIsLoading(true)

      try {
        console.log('💬 Sending question to AI:', input)
        
        const response = await fetch('/api/schemes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: input,
            user_context: {
              state: user?.state,
              district: user?.district,
              crop_type: user?.crop_type,
              land_size: user?.land_size,
            },
          }),
        })

        const data = await response.json()

        console.log('🤖 AI Response:', data)

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to get AI response')
        }

        // Remove loading message and add real response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.loading
              ? {
                  ...msg,
                  text: data.answer || 'I could not process your question. Please try again.',
                  loading: false,
                }
              : msg
          )
        )
      } catch (error) {
        console.error('❌ Error getting AI response:', error)
        
        // Remove loading message and show error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.loading
              ? {
                  ...msg,
                  text: 'Sorry, I encountered an error. Please try again.',
                  loading: false,
                }
              : msg
          )
        )
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSuggestionClick = async (suggestionText: string) => {
    setInput(suggestionText)
    // Trigger the send after setting input
    setTimeout(() => handleSend(), 100)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-6 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => onNavigate("home")} className="hover:bg-primary/80 p-1 rounded transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Ask Kisan Assistant</h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.type === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none"
              }`}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">{msg.text}</p>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 max-w-2xl mx-auto w-full">
          <p className="text-xs font-medium text-muted-foreground mb-3">Ask me about schemes</p>
          <div className="space-y-2">
            {quickSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion.text)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm text-left transition-colors disabled:opacity-50"
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button className="flex-shrink-0 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <Input
            placeholder="Ask about government schemes..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="h-10 flex-1"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </main>
  )
}
"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send, X, Bot, User, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Scheme {
  id: string
  name: string
  title?: string
  description: string
  eligibility: string
  benefits: string
  documents_required?: string
  category?: string
  state?: string
  department?: string
  ministry?: string
  last_updated?: string
  how_to_apply?: string
  link?: string
}

interface SchemeChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheme: Scheme
  userContext?: {
    state?: string
    crop_type?: string
    land_size?: string
  }
  language?: string
}

export function SchemeChatDialog({ 
  open, 
  onOpenChange, 
  scheme,
  userContext,
  language = "english"
}: SchemeChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize conversation with AI greeting
  useEffect(() => {
    if (open && messages.length === 0) {
      initializeChat()
    }
  }, [open])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // Smooth scroll to bottom
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, loading])

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const initializeChat = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/schemes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          userContext,
          language,
          messages: [],
          isInitial: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation')
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages([assistantMessage])
    } catch (error) {
      console.error('Error initializing chat:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble starting our conversation. Please try again.",
        timestamp: new Date(),
      }
      setMessages([errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch('/api/schemes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme,
          userContext,
          language,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          isInitial: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] max-h-[700px] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Fixed Header with gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 via-background to-primary/5 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0 shadow-lg"
                  animate={{ 
                    boxShadow: [
                      "0 0 0 0 rgba(45, 106, 79, 0.2)",
                      "0 0 0 8px rgba(45, 106, 79, 0)",
                      "0 0 0 0 rgba(45, 106, 79, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-base font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    AI Scheme Assistant
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {scheme.name}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </motion.div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0" ref={scrollRef}>
          <div className="px-4 py-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className={`flex gap-3 items-start ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar with pulse animation */}
                  <motion.div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant" 
                        ? "bg-gradient-to-br from-primary to-primary/60 shadow-md" 
                        : "bg-gradient-to-br from-secondary to-secondary/60 shadow-md"
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-secondary-foreground" />
                    )}
                  </motion.div>

                  {/* Message Bubble with hover effect */}
                  <motion.div 
                    className={`flex-1 max-w-[75%] ${
                      message.role === "user" ? "items-end" : "items-start"
                    } flex flex-col gap-1`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className={`rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-md"
                        : "bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-tl-md border border-border/50"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span className={`text-[10px] text-muted-foreground px-2 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator with animation */}
            {loading && (
              <motion.div 
                className="flex gap-3 items-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-border/50">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <motion.span 
                      className="text-xs text-muted-foreground"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Thinking...
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State with animation */}
            {messages.length === 0 && !loading && (
              <motion.div 
                className="text-center py-12 px-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  Initializing conversation...
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Fixed Input Area with gradient border */}
        <motion.div 
          className="px-4 py-4 border-t bg-gradient-to-r from-background via-primary/5 to-background flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about eligibility, benefits, how to apply..."
                disabled={loading}
                className="h-11 resize-none transition-all duration-200 focus:shadow-md border-border/50 focus:border-primary/50"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || loading}
                size="icon"
                className="h-11 w-11 flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 shadow-md transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 px-1">
            Press Enter to send • Shift + Enter for new line
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

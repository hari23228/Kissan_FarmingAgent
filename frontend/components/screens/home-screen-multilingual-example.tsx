/**
 * Example: Updated Home Screen with Multilingual Support
 * This demonstrates how to integrate translation into existing components
 */

"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Leaf, User, LeafIcon, TrendingUp, FileText, MessageCircle } from "lucide-react"
import { useTranslatedText } from "@/lib/translation-utils"
import { translationKeys } from "@/lib/translation-utils"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

interface HomeScreenProps {
  user: any
  onNavigate: (screen: string) => void
  onLogout: () => void
}

export default function HomeScreenMultilingual({ user, onNavigate, onLogout }: HomeScreenProps) {
  const { language, isChangingLanguage } = useLanguage()
  
  // Translated text using hooks
  const greeting = useTranslatedText(translationKeys.home.greeting)
  const userName = user?.name || "Farmer"
  
  // Feature translations
  const diseaseTitle = useTranslatedText(translationKeys.features.diseaseHelp)
  const diseaseDesc = useTranslatedText(translationKeys.features.diseaseSubtitle)
  const pricesTitle = useTranslatedText(translationKeys.features.marketPrices)
  const pricesDesc = useTranslatedText(translationKeys.features.pricesSubtitle)
  const schemesTitle = useTranslatedText(translationKeys.features.govSchemes)
  const schemesDesc = useTranslatedText(translationKeys.features.schemesSubtitle)
  const assistantTitle = useTranslatedText(translationKeys.features.assistant)
  const assistantDesc = useTranslatedText(translationKeys.features.assistantSubtitle)

  const features = [
    {
      id: "disease",
      title: diseaseTitle,
      description: diseaseDesc,
      icon: LeafIcon,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: "prices",
      title: pricesTitle,
      description: pricesDesc,
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: "schemes",
      title: schemesTitle,
      description: schemesDesc,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: "assistant",
      title: assistantTitle,
      description: assistantDesc,
      icon: MessageCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24">
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8 px-6 flex items-center justify-between shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex-1">
          <motion.h1 
            className="text-2xl font-bold flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Leaf className="w-7 h-7" />
            Project Kisan
          </motion.h1>
          <motion.p 
            className="text-base text-primary-foreground/90 mt-1 font-medium"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {greeting}, {userName}!
          </motion.p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher 
            variant="ghost" 
            size="sm" 
            showText={false}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          />
          <motion.button 
            onClick={() => onNavigate("profile")} 
            className="p-3 hover:bg-primary-foreground/20 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className={`px-6 py-8 space-y-5 transition-opacity duration-300 ${isChangingLanguage ? 'opacity-50' : 'opacity-100'}`}>
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
                onClick={() => onNavigate(feature.id)}
              >
                <div className="flex items-start gap-5">
                  <div className={`p-4 ${feature.bgColor} rounded-2xl`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </main>
  )
}

"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Leaf, User, Mic, LeafIcon, TrendingUp, FileText, MessageCircle } from "lucide-react"
import { useTranslatedText } from "@/lib/translation-utils"
import { translationKeys } from "@/lib/translation-utils"
import { useLanguage } from "@/lib/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

interface HomeScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
  onLogout: () => void
}

export default function HomeScreen({ language, user, onNavigate, onLogout }: HomeScreenProps) {
  const { language: currentLang } = useLanguage()
  const userName = user?.name || "Farmer"

  // Translated text
  const greetingText = useTranslatedText(translationKeys.home.greeting)
  const diseaseTitle = useTranslatedText(translationKeys.features.diseaseHelp)
  const diseaseDesc = useTranslatedText(translationKeys.features.diseaseSubtitle)
  const pricesTitle = useTranslatedText(translationKeys.features.marketPrices)
  const pricesDesc = useTranslatedText(translationKeys.features.pricesSubtitle)
  const schemesTitle = useTranslatedText(translationKeys.features.govSchemes)
  const schemesDesc = useTranslatedText(translationKeys.features.schemesSubtitle)
  const assistantTitle = useTranslatedText(translationKeys.features.assistant)
  const assistantDesc = useTranslatedText(translationKeys.features.assistantSubtitle)
  const recentActivityText = useTranslatedText('Recent activity')
  const noQueriesText = useTranslatedText('No recent queries yet')
  const startCheckingText = useTranslatedText('Start by checking your crop health!')

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
        <div>
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
            {greetingText}, {userName}!
          </motion.p>
        </div>
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
      <div className="px-6 py-8 space-y-5">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="p-6 cursor-pointer hover:shadow-xl transition-all border-2 hover:border-primary/30"
                  onClick={() => onNavigate(feature.id as any)}
                >
                  <div className="flex items-start gap-5">
                    <motion.div 
                      className={`${feature.bgColor} p-4 rounded-xl flex-shrink-0`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-8 h-8 ${feature.color}`} strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <motion.div 
        className="px-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="font-bold text-lg text-foreground mb-4">{recentActivityText}</h2>
        <Card className="p-6 text-center border-2 border-dashed">
          <div className="text-muted-foreground py-4">
            <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{noQueriesText}</p>
            <p className="text-xs mt-1">{startCheckingText}</p>
          </div>
        </Card>
      </motion.div>

      {/* Floating Mic Button */}
      <motion.div 
        className="fixed bottom-28 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => onNavigate("assistant")}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            boxShadow: [
              "0 10px 30px rgba(244, 162, 97, 0.3)",
              "0 10px 40px rgba(244, 162, 97, 0.5)",
              "0 10px 30px rgba(244, 162, 97, 0.3)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Mic className="w-7 h-7" strokeWidth={2.5} />
        </motion.button>
      </motion.div>

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-2xl"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: "home", label: "Home", icon: Leaf },
            { id: "disease", label: "Disease", icon: LeafIcon },
            { id: "prices", label: "Prices", icon: TrendingUp },
            { id: "schemes", label: "Schemes", icon: FileText },
            { id: "assistant", label: "Chat", icon: MessageCircle },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => onNavigate(id as any)}
              className="flex-1 py-4 flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-xs font-medium">{label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </main>
  )
}

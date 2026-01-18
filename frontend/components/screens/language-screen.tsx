"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sprout, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { SupportedLanguage } from "@/lib/services/azure-translator"

interface LanguageScreenProps {
  onSelect: (language: string) => void
}

const languages = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
]

export default function LanguageScreen({ onSelect }: LanguageScreenProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const { setLanguage, isChangingLanguage } = useLanguage()

  const handleContinue = async () => {
    if (!selectedLanguage) return
    
    // Set language in the global context (persists to localStorage and Supabase)
    await setLanguage(selectedLanguage as SupportedLanguage)
    
    // Call the parent callback
    onSelect(selectedLanguage)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <motion.div 
        className="w-full max-w-md space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo and Title */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ delay: 0.8, duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sprout className="mx-auto h-20 w-20 text-primary" strokeWidth={2.5} />
          </motion.div>
          <motion.h1 
            className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-bold text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Project Kisan
          </motion.h1>
          <motion.p 
            className="text-base text-muted-foreground px-4 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Select Your Language
            <br />
            <span className="text-lg font-semibold">अपनी भाषा चुनें | உங்கள் மொழி</span>
          </motion.p>
        </motion.div>

        {/* Language Cards */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer border-2 p-6 transition-all relative overflow-hidden ${
                  selectedLanguage === lang.code 
                    ? "border-primary bg-primary/10 shadow-xl shadow-primary/20" 
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setSelectedLanguage(lang.code)}
              >
                <AnimatePresence>
                  {selectedLanguage === lang.code && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute right-4 top-4"
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{lang.flag}</span>
                  <div className="text-left flex-1">
                    <p className="text-2xl font-bold">{lang.nativeName}</p>
                    <p className="text-sm text-muted-foreground">{lang.name}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="w-full text-lg h-14 rounded-xl font-semibold shadow-lg transition-all"
            disabled={!selectedLanguage || isChangingLanguage}
            onClick={handleContinue}
          >
            <motion.span
              animate={selectedLanguage ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isChangingLanguage ? "Loading..." : "Continue → जारी रखें"}
            </motion.span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

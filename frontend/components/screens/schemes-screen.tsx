"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Mic, Loader2, MessageSquare, ExternalLink, Sparkles } from "lucide-react"
import { useState } from "react"
import { SchemeChatDialog } from "@/components/scheme-chat-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslatedText } from "@/lib/translation-utils"
import { useLanguage } from "@/lib/language-context"
import { translatingAiService } from "@/lib/services/translating-ai"

interface SchemesScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
}

type SchemesStep = "search" | "results" | "details"

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

// Indian states for selection
const INDIAN_STATES = [
  'All India',
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh',
  'Bihar', 'West Bengal', 'Punjab', 'Haryana', 'Odisha', 'Jharkhand',
  'Chhattisgarh', 'Assam', 'Uttarakhand', 'Himachal Pradesh', 'Goa'
]

// Categories for filtering
const CATEGORIES = [
  { id: 'all', name: 'All Schemes', emoji: '📋' },
  { id: 'irrigation', name: 'Irrigation', emoji: '💧' },
  { id: 'seeds', name: 'Seeds & Fertilizers', emoji: '🌱' },
  { id: 'machinery', name: 'Machinery', emoji: '🚜' },
  { id: 'insurance', name: 'Insurance', emoji: '🛡️' },
  { id: 'soil', name: 'Soil Health', emoji: '🌍' },
  { id: 'credit', name: 'Credit & Loans', emoji: '💰' },
  { id: 'organic', name: 'Organic Farming', emoji: '🥬' },
]

export default function SchemesScreen({ language, user, onNavigate }: SchemesScreenProps) {
  const { language: currentLang } = useLanguage()
  const [step, setStep] = useState<SchemesStep>("search")
  const [query, setQuery] = useState("")
  const [selectedState, setSelectedState] = useState(user?.state || "All India")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  // Translation hooks
  const headerText = useTranslatedText('Schemes & Subsidies')
  const findSchemesText = useTranslatedText('Find schemes')
  const searchPlaceholderText = useTranslatedText('Drip irrigation subsidy, PM Kisan...')
  const selectStateText = useTranslatedText('Select State')
  const allIndiaText = useTranslatedText('All India')
  const browseCategoryText = useTranslatedText('Browse by category')
  const findButtonText = useTranslatedText('Find Schemes')
  const loadingText = useTranslatedText('Loading...')
  const noSchemesText = useTranslatedText('No schemes found')
  const tryDifferentText = useTranslatedText('Try different search terms or filters')
  const inSimpleWordsText = useTranslatedText('In simple words')
  const whoCanApplyText = useTranslatedText('Who can apply?')
  const benefitsText = useTranslatedText('Benefits')
  const documentsNeededText = useTranslatedText('Documents needed')
  const howToApplyText = useTranslatedText('How to apply')
  const lastUpdatedText = useTranslatedText('Last updated')
  const officialLinkText = useTranslatedText('Official Link')
  const askMoreText = useTranslatedText('Ask about this scheme')
  const viewDetailsText = useTranslatedText('View details')
  const backToResultsText = useTranslatedText('Back to results')
  
  // Category translations
  const allSchemesText = useTranslatedText('All Schemes')
  const irrigationText = useTranslatedText('Irrigation')
  const seedsFertilizersText = useTranslatedText('Seeds & Fertilizers')
  const machineryText = useTranslatedText('Machinery')
  const insuranceText = useTranslatedText('Insurance')
  const soilHealthText = useTranslatedText('Soil Health')
  const creditLoansText = useTranslatedText('Credit & Loans')
  const organicFarmingText = useTranslatedText('Organic Farming')

  // Get translated category name
  const getCategoryName = (catId: string) => {
    switch (catId) {
      case 'all': return allSchemesText
      case 'irrigation': return irrigationText
      case 'seeds': return seedsFertilizersText
      case 'machinery': return machineryText
      case 'insurance': return insuranceText
      case 'soil': return soilHealthText
      case 'credit': return creditLoansText
      case 'organic': return organicFarmingText
      default: return CATEGORIES.find(c => c.id === catId)?.name || catId
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Searching schemes:', { query, state: selectedState, category: selectedCategory })
      
      const params = new URLSearchParams({
        limit: '20',
        ...(query && { search: query }),
        ...(selectedState && selectedState !== 'All India' && { state: selectedState }),
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory }),
      })

      const response = await fetch(`/api/schemes?${params}`)
      const data = await response.json()

      console.log('📊 API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schemes')
      }

      // Handle different response formats
      const schemesData = data.data || data.schemes || []
      
      // Transform schemes to consistent format
      const transformedSchemes = schemesData.map((scheme: any, index: number) => ({
        id: scheme.id || scheme._id || `scheme-${index}`,
        name: scheme.name || scheme.title || scheme.scheme_name || 'Unnamed Scheme',
        title: scheme.title || scheme.name || scheme.scheme_name,
        description: scheme.description || scheme.details || 'No description available',
        eligibility: scheme.eligibility || scheme.who_can_apply || 'Check official website for eligibility',
        benefits: scheme.benefits || scheme.benefit || 'Check official website for benefits',
        documents_required: scheme.documents_required || scheme.documents,
        category: scheme.category || scheme.scheme_category,
        state: scheme.state || selectedState,
        department: scheme.department || scheme.ministry,
        ministry: scheme.ministry || scheme.department,
        last_updated: scheme.last_updated || scheme.updated_at,
        how_to_apply: scheme.how_to_apply || scheme.application_process,
        link: scheme.link || scheme.url || scheme.website,
      }))

      // Translate schemes if user's language is not English
      let finalSchemes = transformedSchemes
      if (currentLang !== 'en' && transformedSchemes.length > 0) {
        try {
          console.log(`Translating ${transformedSchemes.length} schemes to ${currentLang}...`)
          finalSchemes = await translatingAiService.translateSchemes(transformedSchemes, currentLang)
          console.log('✅ Schemes translated successfully')
        } catch (error) {
          console.error('Error translating schemes:', error)
          // Keep original schemes if translation fails
        }
      }

      setSchemes(finalSchemes)
      setStep("results")
    } catch (err) {
      console.error('❌ Error fetching schemes:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch schemes')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = async (categoryId: string) => {
    setSelectedCategory(categoryId)
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '20',
        ...(categoryId !== 'all' && { category: categoryId }),
        ...(selectedState && selectedState !== 'All India' && { state: selectedState }),
      })

      const response = await fetch(`/api/schemes?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schemes')
      }

      const schemesData = data.data || data.schemes || []
      
      const transformedSchemes = schemesData.map((scheme: any, index: number) => ({
        id: scheme.id || scheme._id || `scheme-${index}`,
        name: scheme.name || scheme.title || scheme.scheme_name || 'Unnamed Scheme',
        title: scheme.title || scheme.name || scheme.scheme_name,
        description: scheme.description || scheme.details || 'No description available',
        eligibility: scheme.eligibility || scheme.who_can_apply || 'Check official website',
        benefits: scheme.benefits || scheme.benefit || 'Check official website',
        documents_required: scheme.documents_required || scheme.documents,
        category: scheme.category || categoryId,
        state: scheme.state || selectedState,
        department: scheme.department || scheme.ministry,
        ministry: scheme.ministry || scheme.department,
        last_updated: scheme.last_updated,
        how_to_apply: scheme.how_to_apply,
        link: scheme.link || scheme.url,
      }))

      // Translate schemes if user's language is not English
      let finalSchemes = transformedSchemes
      if (currentLang !== 'en' && transformedSchemes.length > 0) {
        try {
          console.log(`Translating ${transformedSchemes.length} schemes to ${currentLang}...`)
          finalSchemes = await translatingAiService.translateSchemes(transformedSchemes, currentLang)
          console.log('✅ Schemes translated successfully')
        } catch (error) {
          console.error('Error translating schemes:', error)
          // Keep original schemes if translation fails
        }
      }

      setSchemes(finalSchemes)
      setStep("results")
    } catch (err) {
      console.error('❌ Error fetching schemes by category:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch schemes')
    } finally {
      setLoading(false)
    }
  }

  const handleAskAI = () => {
    setChatOpen(true)
  }

  // Handle scheme selection and translate if needed
  const handleSchemeSelect = async (scheme: Scheme) => {
    setSelectedScheme(scheme)
    setStep("details")
    
    // Translate scheme content if not in English
    if (currentLang !== 'en') {
      try {
        const translated = await translatingAiService.translateScheme(scheme, currentLang)
        setSelectedScheme(translated)
      } catch (error) {
        console.error('Error translating scheme:', error)
        // Keep original scheme if translation fails
      }
    }
  }

  if (step === "details" && selectedScheme) {
    return (
      <>
        <main className="min-h-screen bg-background pb-20">
          {/* Header with gradient */}
          <motion.div 
            className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-6 px-6 flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.button 
              onClick={() => { setStep("results"); }} 
              className="hover:bg-primary/80 p-1 rounded transition-colors"
              whileHover={{ scale: 1.1, x: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <h1 className="text-xl font-bold">Scheme Details</h1>
          </motion.div>

          <div className="px-6 py-8 space-y-6 max-w-md mx-auto">
            {/* Scheme Header with animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedScheme.category && (
                  <motion.span 
                    className="inline-block bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                  >
                    {selectedScheme.category}
                  </motion.span>
                )}
                {selectedScheme.state && selectedScheme.state !== 'All India' && (
                  <motion.span 
                    className="inline-block bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                  >
                    {selectedScheme.state}
                  </motion.span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {selectedScheme.name}
              </h2>
              {selectedScheme.department && (
                <p className="text-sm text-muted-foreground mt-1">By {selectedScheme.department}</p>
              )}
            </motion.div>

            {/* Details sections with stagger animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
            >
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {inSimpleWordsText}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedScheme.description}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20"
            >
              <h3 className="font-bold text-foreground mb-3">{whoCanApplyText}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedScheme.eligibility}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="p-4 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20"
            >
              <h3 className="font-bold text-foreground mb-3">{benefitsText}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedScheme.benefits}</p>
            </motion.div>

            {selectedScheme.documents_required && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
              >
                <h3 className="font-bold text-foreground mb-3">{documentsNeededText}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedScheme.documents_required}</p>
              </motion.div>
            )}

            {selectedScheme.how_to_apply && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50"
              >
                <h3 className="font-bold text-foreground mb-3">{howToApplyText}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedScheme.how_to_apply}</p>
              </motion.div>
            )}

            {selectedScheme.last_updated && (
              <motion.div 
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Last updated: {new Date(selectedScheme.last_updated).toLocaleDateString()}
              </motion.div>
            )}

            {/* Action Buttons with hover animations */}
            <motion.div 
              className="space-y-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleAskAI}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with AI about this scheme
                </Button>
              </motion.div>

              {selectedScheme.link && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent hover:bg-muted/50 transition-all duration-200"
                    onClick={() => window.open(selectedScheme.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Official Website
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent hover:bg-muted/50 transition-all duration-200"
                  onClick={() => onNavigate("assistant")}
                >
                  Ask more questions
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Chat Dialog */}
        <SchemeChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          scheme={selectedScheme}
          userContext={{
            state: user?.state,
            crop_type: user?.crop_type,
            land_size: user?.land_size,
          }}
          language={language}
        />
      </>
    )
  }

  if (step === "results") {
    return (
      <main className="min-h-screen bg-background pb-20">
        {/* Header with gradient */}
        <motion.div 
          className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-6 px-6 flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button 
            onClick={() => setStep("search")} 
            className="hover:bg-primary/80 p-1 rounded transition-colors"
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Schemes Found ({schemes.length})</h1>
            <p className="text-sm opacity-80">
              {selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory)?.name : 'All categories'}
              {selectedState !== 'All India' ? ` • ${selectedState}` : ''}
            </p>
          </div>
        </motion.div>

        <div className="px-6 py-8 space-y-4 max-w-md mx-auto">
          {schemes.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-muted-foreground mb-4">No schemes found. Try a different search or category.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={() => setStep("search")}>
                  New Search
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {schemes.map((scheme, index) => (
                <motion.div
                  key={scheme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-border/50 bg-gradient-to-br from-background to-muted/20"
                    onClick={() => handleSchemeSelect(scheme)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-foreground flex-1 line-clamp-2">{scheme.title}</h3>
                      {scheme.category && (
                        <motion.span 
                          className="text-xs font-bold text-primary ml-2 flex-shrink-0 bg-gradient-to-r from-primary/10 to-primary/20 px-2 py-1 rounded"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.2 }}
                        >
                          {getCategoryName(scheme.category)}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                      {scheme.description}
                    </p>
                    {scheme.state && scheme.state !== 'All India' && (
                      <p className="text-xs text-muted-foreground mb-2">📍 {scheme.state}</p>
                    )}
                    <Button variant="outline" className="w-full text-xs h-9 bg-transparent hover:bg-primary/5 transition-colors">
                      {viewDetailsText}
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header with gradient */}
      <motion.div 
        className="bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground py-6 px-6 flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.button 
          onClick={() => onNavigate("home")} 
          className="hover:bg-primary/80 p-1 rounded transition-colors"
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <h1 className="text-xl font-bold">{headerText}</h1>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 max-w-md mx-auto">
        {/* Search with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-foreground mb-2">{findSchemesText}</label>
          <div className="relative">
            <Input
              placeholder={searchPlaceholderText}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="h-12 pr-10 transition-all duration-200 focus:shadow-md border-border/50 focus:border-primary/50"
            />
            <motion.button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Mic className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* State Selection with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-foreground mb-2">{selectStateText}</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full h-12 px-3 border border-border/50 rounded-lg bg-background text-foreground transition-all duration-200 focus:border-primary/50 focus:shadow-md"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </motion.div>

        {/* Categories with stagger animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">{browseCategoryText}</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat, index) => (
              <motion.button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                disabled={loading}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-md'
                    : 'bg-gradient-to-br from-muted to-muted/50 hover:from-primary/20 hover:to-primary/10 text-foreground border border-border/50'
                } disabled:opacity-50`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05, type: "spring", stiffness: 500 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{cat.emoji}</span>
                <span className="text-left">{getCategoryName(cat.id)}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Error Message with animation */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm border border-destructive/20"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Button with animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={handleSearch} 
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {loadingText}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {findButtonText}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </main>
  )
}

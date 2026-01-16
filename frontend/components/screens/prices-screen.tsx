"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChevronLeft, TrendingUp, TrendingDown, Minus, Loader2, Mic, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

interface PricesScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
}

type PricesStep = "query" | "result"

interface MandiPrice {
  market: string
  district: string
  state: string
  commodity: string
  variety: string
  min_price: number
  max_price: number
  modal_price: number
  arrival_date: string
  trend: 'up' | 'down' | 'stable'
}

interface PriceAnalysis {
  avgPrice: number
  minPrice: number
  maxPrice: number
  priceChange: number
  trend: 'up' | 'down' | 'stable'
  recommendation: 'sell_now' | 'hold' | 'wait'
  reasons: string[]
}

// Indian states
const INDIAN_STATES = [
  'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh',
  'Bihar', 'West Bengal', 'Punjab', 'Haryana', 'Odisha'
]

// Common crops
const CROPS = [
  'Tomato', 'Onion', 'Potato', 'Paddy', 'Wheat', 'Cotton',
  'Sugarcane', 'Maize', 'Groundnut', 'Soybean', 'Chilli',
  'Banana', 'Rice', 'Brinjal', 'Cauliflower'
]

// Mandis by state
const MANDIS_BY_STATE: Record<string, string[]> = {
  'Tamil Nadu': ['Coimbatore', 'Salem', 'Erode', 'Madurai', 'Chennai', 'Tirupur', 'Trichy'],
  'Kerala': ['Kochi', 'Trivandrum', 'Kozhikode', 'Thrissur', 'Palakkad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Mangalore'],
  'Andhra Pradesh': ['Vijayawada', 'Guntur', 'Visakhapatnam', 'Tirupati', 'Kurnool'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Aurangabad'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Haryana': ['Karnal', 'Hisar', 'Rohtak', 'Panipat', 'Ambala'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
  'West Bengal': ['Kolkata', 'Siliguri', 'Asansol', 'Durgapur', 'Howrah'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur'],
}

export default function PricesScreen({ language, user, onNavigate }: PricesScreenProps) {
  const [step, setStep] = useState<PricesStep>("query")
  const [crop, setCrop] = useState("Tomato")
  const [quantity, setQuantity] = useState("100")
  const [unit, setUnit] = useState("kg")
  const [state, setState] = useState(user?.state || "Tamil Nadu")
  const [mandi, setMandi] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Results state
  const [mandiPrices, setMandiPrices] = useState<MandiPrice[]>([])
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null)
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Get available mandis for selected state
  const availableMandis = MANDIS_BY_STATE[state] || []

  // Update mandi when state changes
  useEffect(() => {
    if (availableMandis.length > 0 && !availableMandis.includes(mandi)) {
      setMandi(availableMandis[0])
    }
  }, [state, availableMandis, mandi])

  const handleGetPrices = async () => {
    if (!crop || !quantity || !state) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Fetching market prices:', { crop, state, quantity, unit })

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: crop,
          state,
          quantity: parseInt(quantity),
          unit,
          generateAdvice: true,
        }),
      })

      const data = await response.json()
      console.log('📊 Market data received:', data)

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch prices')
      }

      setMandiPrices(data.mandiPrices || [])
      setAnalysis(data.analysis || null)
      setAiAdvice(data.aiAdvice || null)
      setStep("result")
    } catch (err) {
      console.error('❌ Error fetching prices:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }

  const handleAskKisan = async () => {
    setAiLoading(true)
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: crop,
          state,
          quantity: parseInt(quantity),
          unit,
          generateAdvice: true,
        }),
      })

      const data = await response.json()
      if (data.aiAdvice) {
        setAiAdvice(data.aiAdvice)
      }
    } catch (err) {
      console.error('Error getting AI advice:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleClear = () => {
    setCrop("Tomato")
    setQuantity("100")
    setUnit("kg")
    setMandi("")
    setError(null)
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-yellow-600" />
    }
  }

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'sell_now':
        return 'Sell Now'
      case 'hold':
        return 'Hold'
      case 'wait':
        return 'Wait'
      default:
        return rec
    }
  }

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'sell_now':
        return 'text-green-600'
      case 'hold':
        return 'text-yellow-600'
      case 'wait':
        return 'text-red-600'
      default:
        return 'text-primary'
    }
  }

  if (step === "result") {
    return (
      <main className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6 px-6 flex items-center gap-4">
          <button onClick={() => setStep("query")} className="hover:bg-primary/80 p-1 rounded transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Market Prices</h1>
            <p className="text-sm opacity-80">{crop} in {state}</p>
          </div>
          <button 
            onClick={handleGetPrices}
            className="p-2 hover:bg-primary/80 rounded transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Prices */}
        <div className="px-6 py-6 space-y-4 max-w-md mx-auto">
          {/* Summary Card */}
          {analysis && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Average Price</span>
                <span className="text-sm font-medium flex items-center gap-1">
                  {getTrendIcon(analysis.trend)}
                  {analysis.priceChange > 0 ? '+' : ''}{analysis.priceChange}%
                </span>
              </div>
              <p className="text-2xl font-bold text-primary">₹{analysis.avgPrice}/quintal</p>
              <p className="text-xs text-muted-foreground mt-1">
                Range: ₹{analysis.minPrice} - ₹{analysis.maxPrice}
              </p>
            </Card>
          )}

          {/* Mandi Price Cards */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Nearby Mandis</h3>
            {mandiPrices.length === 0 ? (
              <p className="text-muted-foreground text-sm">No mandi data available</p>
            ) : (
              mandiPrices.map((mandiData, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{mandiData.market}</h3>
                      <p className="text-xs text-muted-foreground">{mandiData.variety} variety</p>
                    </div>
                    {getTrendIcon(mandiData.trend)}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Min</p>
                      <p className="font-bold text-foreground">₹{mandiData.min_price}</p>
                    </div>
                    <div className="text-center border-l border-r border-border">
                      <p className="text-muted-foreground text-xs">Modal</p>
                      <p className="font-bold text-primary">₹{mandiData.modal_price}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Max</p>
                      <p className="font-bold text-foreground">₹{mandiData.max_price}</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Recommendation Card */}
          {analysis && (
            <Card className="p-4 border-l-4 border-l-primary bg-primary/5">
              <h3 className="font-bold text-foreground mb-3">Selling Recommendation</h3>
              <p className={`text-xl font-bold mb-3 ${getRecommendationColor(analysis.recommendation)}`}>
                {getRecommendationText(analysis.recommendation)}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {analysis.reasons.map((reason, idx) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
              
              {/* Estimated Earnings */}
              {quantity && analysis.avgPrice > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Estimated earnings for {quantity} {unit}:</p>
                  <p className="text-lg font-bold text-primary">
                    ₹{Math.round((parseInt(quantity) * analysis.avgPrice) / (unit === 'quintal' ? 1 : 100))}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* AI Advice Card */}
          {aiAdvice && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                🤖 AI Market Analysis
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiAdvice}</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline" className="bg-transparent">
              Read aloud
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent"
              onClick={handleAskKisan}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Explain why'
              )}
            </Button>
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Compare mandis
          </Button>
          <Button 
            variant="outline" 
            className="w-full bg-transparent"
            onClick={() => onNavigate("assistant")}
          >
            Ask Kisan AI
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-6 flex items-center gap-4">
        <button onClick={() => onNavigate("home")} className="hover:bg-primary/80 p-1 rounded transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Market Prices & Selling Advice</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Voice tip: "Today tomato price in Coimbatore mandi"
        </p>

        {/* Crop Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Crop *</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full h-12 px-3 border border-border rounded-lg bg-background text-foreground"
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 h-12"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="h-12 px-3 border border-border rounded-lg bg-background text-foreground"
            >
              <option value="kg">kg</option>
              <option value="quintal">quintal</option>
            </select>
          </div>
        </div>

        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">State *</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full h-12 px-3 border border-border rounded-lg bg-background text-foreground"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Mandi Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Nearest Mandi</label>
          <select
            value={mandi}
            onChange={(e) => setMandi(e.target.value)}
            className="w-full h-12 px-3 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">All mandis in {state}</option>
            {availableMandis.map((m) => (
              <option key={m} value={m}>{m} Mandi</option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleGetPrices}
            disabled={!crop || !quantity || !state || loading}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching Prices...
              </>
            ) : (
              'Get Prices & Advice'
            )}
          </Button>
          <Button 
            variant="outline" 
            className="h-12 bg-transparent px-6"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
      </div>
    </main>
  )
}

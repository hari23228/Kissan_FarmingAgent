"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"
import { useTranslatedText } from "@/lib/translation-utils"
import { useLanguage } from "@/lib/language-context"

interface ProfileSetupScreenProps {
  language: string
  onComplete: (profileData: any) => void
}

export default function ProfileSetupScreen({ language, onComplete }: ProfileSetupScreenProps) {
  const { language: currentLang } = useLanguage()
  const [primaryCrops, setPrimaryCrops] = useState<string[]>([])
  const [landSize, setLandSize] = useState("")
  const [irrigation, setIrrigation] = useState("")

  // Translated text
  const titleText = useTranslatedText('Tell us about your farm')
  const primaryCropsText = useTranslatedText('Primary crops')
  const landSizeText = useTranslatedText('Land size')
  const irrigationText = useTranslatedText('Irrigation method')
  const saveGoHomeText = useTranslatedText('Save & Go to Home')

  // Translated options
  const paddyText = useTranslatedText('Paddy')
  const wheatText = useTranslatedText('Wheat')
  const tomatoText = useTranslatedText('Tomato')
  const cottonText = useTranslatedText('Cotton')
  const sugarcaneText = useTranslatedText('Sugarcane')
  const otherText = useTranslatedText('Other')

  const lessThan1Text = useTranslatedText('Less than 1 acre')
  const oneToThreeText = useTranslatedText('1–3 acres')
  const moreThan3Text = useTranslatedText('More than 3 acres')

  const rainfedText = useTranslatedText('Rainfed')
  const borewellText = useTranslatedText('Borewell')
  const canalText = useTranslatedText('Canal')
  const dripText = useTranslatedText('Drip')
  const sprinklerText = useTranslatedText('Sprinkler')

  const crops = [
    { key: "Paddy", label: paddyText },
    { key: "Wheat", label: wheatText },
    { key: "Tomato", label: tomatoText },
    { key: "Cotton", label: cottonText },
    { key: "Sugarcane", label: sugarcaneText },
    { key: "Other", label: otherText }
  ]
  const landSizes = [
    { key: "Less than 1 acre", label: lessThan1Text },
    { key: "1–3 acres", label: oneToThreeText },
    { key: "More than 3 acres", label: moreThan3Text }
  ]
  const irrigationMethods = [
    { key: "Rainfed", label: rainfedText },
    { key: "Borewell", label: borewellText },
    { key: "Canal", label: canalText },
    { key: "Drip", label: dripText },
    { key: "Sprinkler", label: sprinklerText }
  ]

  const toggleCrop = (cropKey: string) => {
    setPrimaryCrops((prev) => (prev.includes(cropKey) ? prev.filter((c) => c !== cropKey) : [...prev, cropKey]))
  }

  const handleComplete = () => {
    if (primaryCrops.length > 0 && landSize && irrigation) {
      onComplete({
        primaryCrops,
        landSize,
        irrigation,
      })
    }
  }

  const isComplete = primaryCrops.length > 0 && landSize && irrigation

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          {titleText}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full overflow-y-auto pb-20">
        {/* Primary Crops */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">{primaryCropsText}</h2>
          <div className="grid grid-cols-2 gap-2">
            {crops.map((crop) => (
              <button
                key={crop.key}
                onClick={() => toggleCrop(crop.key)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  primaryCrops.includes(crop.key)
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </div>

        {/* Land Size */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">{landSizeText}</h2>
          <div className="space-y-2">
            {landSizes.map((size) => (
              <button
                key={size.key}
                onClick={() => setLandSize(size.key)}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all text-left ${
                  landSize === size.key
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Irrigation */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">{irrigationText}</h2>
          <div className="space-y-2">
            {irrigationMethods.map((method) => (
              <button
                key={method.key}
                onClick={() => setIrrigation(method.key)}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all text-left ${
                  irrigation === method.key
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="px-6 py-4 border-t border-border bg-card">
        <Button
          onClick={handleComplete}
          disabled={!isComplete}
          className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
        >
          {saveGoHomeText}
        </Button>
      </div>
    </main>
  )
}

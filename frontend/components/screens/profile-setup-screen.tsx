"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"

interface ProfileSetupScreenProps {
  language: string
  onComplete: (profileData: any) => void
}

export default function ProfileSetupScreen({ language, onComplete }: ProfileSetupScreenProps) {
  const [primaryCrops, setPrimaryCrops] = useState<string[]>([])
  const [landSize, setLandSize] = useState("")
  const [irrigation, setIrrigation] = useState("")

  const crops = ["Paddy", "Wheat", "Tomato", "Cotton", "Sugarcane", "Other"]
  const landSizes = ["Less than 1 acre", "1–3 acres", "More than 3 acres"]
  const irrigationMethods = ["Rainfed", "Borewell", "Canal", "Drip", "Sprinkler"]

  const toggleCrop = (crop: string) => {
    setPrimaryCrops((prev) => (prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]))
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
          Tell us about your farm
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full overflow-y-auto pb-20">
        {/* Primary Crops */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">Primary crops</h2>
          <div className="grid grid-cols-2 gap-2">
            {crops.map((crop) => (
              <button
                key={crop}
                onClick={() => toggleCrop(crop)}
                className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                  primaryCrops.includes(crop)
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Land Size */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">Land size</h2>
          <div className="space-y-2">
            {landSizes.map((size) => (
              <button
                key={size}
                onClick={() => setLandSize(size)}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all text-left ${
                  landSize === size
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Irrigation */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-foreground mb-4">Irrigation method</h2>
          <div className="space-y-2">
            {irrigationMethods.map((method) => (
              <button
                key={method}
                onClick={() => setIrrigation(method)}
                className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all text-left ${
                  irrigation === method
                    ? "bg-primary text-primary-foreground border-2 border-primary"
                    : "bg-muted text-foreground border-2 border-transparent hover:border-primary"
                }`}
              >
                {method}
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
          Save & Go to Home
        </Button>
      </div>
    </main>
  )
}

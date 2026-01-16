"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Mic, Upload, Camera } from "lucide-react"

interface DiseaseScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
}

type DiseaseStep = "input" | "result"

export default function DiseaseScreen({ language, user, onNavigate }: DiseaseScreenProps) {
  const [step, setStep] = useState<DiseaseStep>("input")
  const [crop, setCrop] = useState("")
  const [stage, setStage] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)

  const crops = ["Tomato", "Paddy", "Wheat", "Cotton", "Sugarcane", "Other"]
  const stages = ["Seedling", "Vegetative", "Flowering", "Fruiting", "Harvest"]

  const handleAnalyze = () => {
    if (image && crop && stage) {
      setStep("result")
    }
  }

  if (step === "result") {
    return (
      <main className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-6 px-6 flex items-center gap-4">
          <button onClick={() => setStep("input")} className="hover:bg-primary/80 p-1 rounded transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Disease Analysis</h1>
        </div>

        {/* Result */}
        <div className="px-6 py-8 space-y-6">
          {/* Summary */}
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <div className="mb-4">
              <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                Probable diagnosis
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Early Blight</h2>
            <p className="text-sm text-muted-foreground">Common fungal disease affecting tomato plants</p>
          </Card>

          {/* Sections */}
          <div>
            <h3 className="font-bold text-foreground mb-3">What is happening</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Brown or black lesions appear on lower leaves</li>
              <li>• Concentric rings form around affected areas</li>
              <li>• Leaves gradually yellow and drop from the plant</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-3">What you should do now</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Remove affected leaves with pruning shears</li>
              <li>2. Apply copper fungicide or organic alternatives</li>
              <li>3. Improve air circulation around plants</li>
              <li>4. Water at the base to keep leaves dry</li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-3">Prevention for future</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Plant resistant varieties</li>
              <li>• Practice crop rotation</li>
              <li>• Use mulch to prevent soil splash</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-3">Safety tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Wear gloves when handling infected plants</li>
              <li>• Wash hands after handling</li>
              <li>• Keep children away from treated areas</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">Read aloud</Button>
            <Button variant="outline">Simpler words</Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">Ask follow-up</Button>
            <Button onClick={() => setStep("input")} className="bg-primary hover:bg-primary/90">
              Check another
            </Button>
          </div>
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
        <h1 className="text-xl font-bold">Crop Disease Help</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-8 space-y-6 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground">Take a clear photo of the affected part of the plant.</p>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Plant photo</label>
          {image ? (
            <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
              <img src={image || "/placeholder.svg"} alt="Plant" className="w-full h-full object-cover" />
              <button
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 bg-transparent">
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 bg-transparent"
                onClick={() => setImage("/plant-disease.jpg")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          )}
        </div>

        {/* Crop */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Select crop</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full h-12 px-3 border border-border rounded-lg bg-input text-foreground"
          >
            <option value="">Choose a crop</option>
            {crops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Growth stage</label>
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full h-12 px-3 border border-border rounded-lg bg-input text-foreground"
          >
            <option value="">Choose a stage</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Describe the problem (optional)</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yellow spots, dry leaves, appeared 3 days ago..."
              className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground resize-none"
            />
            <button className="absolute bottom-3 right-3 text-muted-foreground hover:text-foreground">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleAnalyze}
            disabled={!image || !crop || !stage}
            className="flex-1 h-12 bg-primary hover:bg-primary/90"
          >
            Analyze Disease
          </Button>
          <Button variant="outline" className="flex-1 h-12 bg-transparent">
            Clear
          </Button>
        </div>
      </div>
    </main>
  )
}

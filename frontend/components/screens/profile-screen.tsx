"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ProfileScreenProps {
  language: string
  user: any
  onNavigate: (screen: string) => void
  onLogout: () => void
}

export default function ProfileScreen({ language, user, onNavigate, onLogout }: ProfileScreenProps) {
  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-6 flex items-center gap-4">
        <button onClick={() => onNavigate("home")} className="hover:bg-primary/80 p-1 rounded transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Profile & Settings</h1>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-md mx-auto w-full space-y-8">
        {/* Profile Info */}
        <div>
          <h2 className="font-bold text-foreground mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
              <p className="text-foreground">{user?.name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Phone number</p>
              <p className="text-foreground">{user?.phone || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">State</p>
              <p className="text-foreground">{user?.state || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">District</p>
              <p className="text-foreground">{user?.district || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Primary crops</p>
              <p className="text-foreground">{user?.primaryCrops?.join(", ") || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="font-bold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Language</label>
              <select
                value={language}
                className="w-full h-10 px-3 border border-border rounded-lg bg-input text-foreground"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Voice speed</label>
              <select
                defaultValue="normal"
                className="w-full h-10 px-3 border border-border rounded-lg bg-input text-foreground"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button variant="outline" className="w-full h-12 bg-transparent">
            Save changes
          </Button>
          <Button onClick={onLogout} className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white">
            Logout
          </Button>
        </div>
      </div>
    </main>
  )
}

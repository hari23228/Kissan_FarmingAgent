"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import LanguageScreen from "@/components/screens/language-screen"
import LoginScreen from "@/components/screens/login-screen"
import ProfileSetupScreen from "@/components/screens/profile-setup-screen"
import HomeScreen from "@/components/screens/home-screen"
import DiseaseScreen from "@/components/screens/disease-screen"
import PricesScreen from "@/components/screens/prices-screen"
import SchemesScreen from "@/components/screens/schemes-screen"
import AssistantScreen from "@/components/screens/assistant-screen"
import ProfileScreen from "@/components/screens/profile-screen"

type AppScreen =
  | "language"
  | "login"
  | "profile-setup"
  | "home"
  | "disease"
  | "prices"
  | "schemes"
  | "assistant"
  | "profile"

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("language")
  const { language } = useLanguage() // Use global language context
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Initialize from local storage
  useEffect(() => {
    // Check if user has already selected a language
    const hasLanguagePreference = localStorage.getItem("kisan_app_language")
    const savedUser = localStorage.getItem("kisan_user")

    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsLoggedIn(true)
      if (!userData.profileSetup) {
        setCurrentScreen("profile-setup")
      } else {
        setCurrentScreen("home")
      }
    } else if (hasLanguagePreference) {
      // Language already selected, skip to login
      setCurrentScreen("login")
    } else {
      // First time user, show language selection
      setCurrentScreen("language")
    }
  }, [])

  const handleLanguageSelect = (lang: string) => {
    // Language is already set in the context by LanguageScreen component
    setCurrentScreen("login")
  }

  const handleLogin = (userData: any) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem("kisan_user", JSON.stringify(userData))
    setCurrentScreen("profile-setup")
  }

  const handleProfileSetup = (profileData: any) => {
    const updatedUser = { ...user, ...profileData, profileSetup: true }
    setUser(updatedUser)
    localStorage.setItem("kisan_user", JSON.stringify(updatedUser))
    setCurrentScreen("home")
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("kisan_user")
    setCurrentScreen("language")
  }

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen)
  }

  // Render current screen
  const screenProps = {
    language,
    user,
    onNavigate: handleNavigate,
    onLogout: handleLogout,
  }

  switch (currentScreen) {
    case "language":
      return <LanguageScreen onSelect={handleLanguageSelect} />
    case "login":
      return <LoginScreen language={language} onLogin={handleLogin} />
    case "profile-setup":
      return <ProfileSetupScreen language={language} onComplete={handleProfileSetup} />
    case "home":
      return <HomeScreen {...screenProps} />
    case "disease":
      return <DiseaseScreen {...screenProps} />
    case "prices":
      return <PricesScreen {...screenProps} />
    case "schemes":
      return <SchemesScreen {...screenProps} />
    case "assistant":
      return <AssistantScreen {...screenProps} />
    case "profile":
      return <ProfileScreen {...screenProps} />
    default:
      return <LanguageScreen onSelect={handleLanguageSelect} />
  }
}

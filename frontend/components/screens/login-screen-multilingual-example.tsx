/**
 * Example: Login Screen with Full Multilingual Support
 * Shows how to integrate translation hooks into existing screens
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Leaf } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTranslatedText } from "@/lib/translation-utils"
import { translationKeys } from "@/lib/translation-utils"
import { useLanguage } from "@/lib/language-context"

interface LoginScreenProps {
  onLogin: (userData: any) => void
}

type TabType = "login" | "signup"
type AuthMethod = "phone" | "email"

export default function LoginScreenMultilingual({ onLogin }: LoginScreenProps) {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("login")
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Translated text
  const loginText = useTranslatedText(translationKeys.auth.login)
  const signupText = useTranslatedText(translationKeys.auth.signup)
  const emailText = useTranslatedText(translationKeys.auth.email)
  const passwordText = useTranslatedText(translationKeys.auth.password)
  const phoneText = useTranslatedText(translationKeys.auth.phone)
  const nameText = useTranslatedText(translationKeys.auth.name)
  const continueText = useTranslatedText(translationKeys.common.continue)
  const enterOTPText = useTranslatedText(translationKeys.auth.enterOTP)
  const verifyOTPText = useTranslatedText(translationKeys.auth.verifyOTP)
  const loadingText = useTranslatedText(translationKeys.common.loading)
  const dontHaveAccountText = useTranslatedText(translationKeys.auth.dontHaveAccount)
  const alreadyHaveAccountText = useTranslatedText(translationKeys.auth.alreadyHaveAccount)

  const handleGetOTP = async () => {
    if (phone.length !== 10) return
    
    setLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": language // Send language with API request
        },
        body: JSON.stringify({ phone: `+91${phone}` }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowOTP(true)
        toast({
          title: await useTranslatedText("OTP Sent"),
          description: data.message || await useTranslatedText("Check your phone for the OTP"),
        })
      } else {
        toast({
          title: await useTranslatedText(translationKeys.common.error),
          description: data.error || await useTranslatedText("Failed to send OTP"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: await useTranslatedText(translationKeys.common.error),
        description: await useTranslatedText(translationKeys.errors.networkError),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": language // Send language with API request
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user)
        toast({
          title: await useTranslatedText(translationKeys.auth.loginSuccess),
        })
      } else {
        toast({
          title: await useTranslatedText(translationKeys.common.error),
          description: data.error || await useTranslatedText(translationKeys.auth.invalidCredentials),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: await useTranslatedText(translationKeys.common.error),
        description: await useTranslatedText(translationKeys.errors.networkError),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Leaf className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold">{loginText}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "login" ? "bg-background shadow-sm" : ""
            }`}
          >
            {loginText}
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 rounded-md transition-all ${
              activeTab === "signup" ? "bg-background shadow-sm" : ""
            }`}
          >
            {signupText}
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {activeTab === "signup" && (
            <Input
              placeholder={nameText}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          {authMethod === "email" ? (
            <>
              <Input
                type="email"
                placeholder={emailText}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder={passwordText}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          ) : (
            <Input
              placeholder={phoneText}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
          )}

          {showOTP && (
            <Input
              placeholder={enterOTPText}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          )}

          <Button
            className="w-full"
            onClick={authMethod === "email" ? handleEmailLogin : handleGetOTP}
            disabled={loading}
          >
            {loading ? loadingText : showOTP ? verifyOTPText : continueText}
          </Button>
        </div>

        {/* Toggle Link */}
        <p className="text-center text-sm text-muted-foreground">
          {activeTab === "login" ? dontHaveAccountText : alreadyHaveAccountText}{" "}
          <button
            onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
            className="text-primary font-medium"
          >
            {activeTab === "login" ? signupText : loginText}
          </button>
        </p>
      </div>
    </div>
  )
}

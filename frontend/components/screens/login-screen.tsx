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
  language: string
  onLogin: (userData: any) => void
}

type TabType = "login" | "signup"
type AuthMethod = "phone" | "email"

export default function LoginScreen({ language, onLogin }: LoginScreenProps) {
  const { language: currentLang } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("login")
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [state, setState] = useState("")
  const [district, setDistrict] = useState("")
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
  const loadingText = useTranslatedText(translationKeys.common.loading)
  const newUserText = useTranslatedText('New user')
  const phoneOTPText = useTranslatedText('Phone OTP')
  const enterOTPText = useTranslatedText(translationKeys.auth.enterOTP)
  const verifyOTPText = useTranslatedText(translationKeys.auth.verifyOTP)
  const errorText = useTranslatedText(translationKeys.common.error)
  const successText = useTranslatedText(translationKeys.common.success)
  const stateText = useTranslatedText('State')
  const districtText = useTranslatedText('District')
  const selectStateText = useTranslatedText('Select state')
  const selectDistrictText = useTranslatedText('Select district')
  const getOTPText = useTranslatedText('Get OTP')
  const processingText = useTranslatedText('Processing...')
  const verifyingText = useTranslatedText('Verifying...')
  const verifyContinueText = useTranslatedText('Verify & Continue')
  const changePhoneText = useTranslatedText('Change phone number')
  const verifyOTPHeaderText = useTranslatedText('Verify OTP')
  const otpSentToText = useTranslatedText('Enter the OTP sent to')
  const enterOTPPlaceholderText = useTranslatedText('Enter OTP')
  const consentText = useTranslatedText('I agree to use this app for information only. I will confirm with local experts if needed.')
  const yourNameText = useTranslatedText('Your name (optional)')
  const enterNameText = useTranslatedText('Enter your name')

  const handleGetOTP = async () => {
    if (phone.length !== 10) return
    
    setLoading(true)
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": currentLang
        },
        body: JSON.stringify({ phone: `+91${phone}` }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowOTP(true)
        toast({
          title: "OTP Sent",
          description: data.message || "Check your phone for the OTP",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send OTP",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 4) return

    setLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91${phone}`,
          otp,
          userData: activeTab === "signup" ? {
            name,
            language,
            state,
            district,
          } : { language },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Login successful!",
        })
        onLogin({
          ...data.user,
          state: activeTab === "signup" ? state : "",
          district: activeTab === "signup" ? district : "",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Invalid OTP",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async () => {
    if (!email || !password) return

    setLoading(true)
    try {
      const endpoint = activeTab === "signup" ? "/api/auth/register" : "/api/auth/login"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(activeTab === "signup" && { name, phone, language }),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        if (activeTab === "signup") {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          })
          // Don't auto-login after signup, wait for email confirmation
          setEmail("")
          setPassword("")
          setActiveTab("login")
        } else {
          toast({
            title: "Success",
            description: "Login successful!",
          })
          // Pass user data to parent component
          onLogin({
            id: data.user.id,
            email: data.user.email,
            name: data.user.profile?.name || data.user.user_metadata?.name || null,
            phone: data.user.profile?.phone || data.user.user_metadata?.phone || null,
            language: data.user.profile?.language || data.user.user_metadata?.language || 'en',
            profileSetup: !!(data.user.profile?.name && data.user.profile?.phone),
            state: state || "",
            district: district || "",
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Authentication failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Authentication error:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8 px-6">
        <div className="flex items-center justify-center mb-2">
          <Leaf className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-center">Project Kisan</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        {!showOTP ? (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                  activeTab === "login"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {loginText}
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`flex-1 py-2 px-4 rounded font-medium transition-colors ${
                  activeTab === "signup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {newUserText}
              </button>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-6 bg-muted/50 p-1 rounded-lg">
              <button
                onClick={() => {
                  setAuthMethod("phone")
                  setShowOTP(false)
                }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  authMethod === "phone"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {phoneOTPText}
              </button>
              <button
                onClick={() => {
                  setAuthMethod("email")
                  setShowOTP(false)
                }}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  authMethod === "email"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {emailText}
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {activeTab === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{yourNameText}</label>
                    <Input
                      type="text"
                      placeholder={enterNameText}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{stateText}</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full h-12 px-3 border border-border rounded-lg bg-input text-foreground"
                    >
                      <option value="">{selectStateText}</option>
                      <option value="tamil_nadu">Tamil Nadu</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="punjab">Punjab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{districtText}</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full h-12 px-3 border border-border rounded-lg bg-input text-foreground"
                    >
                      <option value="">{selectDistrictText}</option>
                      <option value="coimbatore">Coimbatore</option>
                      <option value="salem">Salem</option>
                      <option value="erode">Erode</option>
                    </select>
                  </div>
                </>
              )}

              {authMethod === "phone" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{phoneText}</label>
                  <Input
                    type="tel"
                    placeholder={phoneText}
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="h-12"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{emailText}</label>
                    <Input
                      type="email"
                      placeholder={emailText}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">{passwordText}</label>
                    <Input
                      type="password"
                      placeholder={passwordText}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                    />
                  </div>
                </>
              )}

              {activeTab === "signup" && (
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="consent" className="mt-1" />
                  <label htmlFor="consent" className="text-xs text-muted-foreground">
                    {consentText}
                  </label>
                </div>
              )}
            </div>

            {/* Button */}
            <Button
              onClick={authMethod === "phone" ? handleGetOTP : handleEmailAuth}
              disabled={
                loading ||
                (authMethod === "phone" ? phone.length !== 10 : !email || !password)
              }
              className="w-full h-12 mt-8 text-base font-medium bg-primary hover:bg-primary/90"
            >
              {loading ? processingText : authMethod === "phone" ? getOTPText : activeTab === "signup" ? signupText : loginText}
            </Button>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">{verifyOTPHeaderText}</h2>
              <p className="text-sm text-muted-foreground">{otpSentToText} {phone}</p>
            </div>

            <div className="space-y-4">
              <Input
                type="text"
                placeholder={enterOTPPlaceholderText}
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="h-12 text-center tracking-widest text-lg"
              />

              <Button
                onClick={handleVerifyOTP}
                disabled={otp.length < 4 || loading}
                className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              >
                {loading ? verifyingText : verifyContinueText}
              </Button>

              <button onClick={() => setShowOTP(false)} className="w-full text-sm text-primary hover:underline py-2">
                {changePhoneText}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

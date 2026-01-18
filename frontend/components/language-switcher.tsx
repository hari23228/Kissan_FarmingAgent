/**
 * Language Switcher Component
 * Allows users to switch between English, Hindi, and Tamil
 */

'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SupportedLanguage } from '@/lib/services/azure-translator'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const languages = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
}

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  className?: string
}

export function LanguageSwitcher({
  variant = 'ghost',
  size = 'default',
  showText = true,
  className,
}: LanguageSwitcherProps) {
  const { language, setLanguage, isChangingLanguage } = useLanguage()

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    if (newLang !== language) {
      await setLanguage(newLang)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
          disabled={isChangingLanguage}
        >
          <Languages className="h-4 w-4" />
          {showText && <span>{languages[language].native}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languages).map(([code, { native }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as SupportedLanguage)}
            className={cn(
              'cursor-pointer',
              language === code && 'bg-accent font-semibold'
            )}
          >
            <div className="flex items-center justify-between w-full">
              <span>{native}</span>
              {language === code && (
                <span className="text-xs text-muted-foreground">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Full-screen Language Selection (for first-time users)
 */
export function LanguageSelection({
  onComplete,
}: {
  onComplete?: (lang: SupportedLanguage) => void
}) {
  const { setLanguage } = useLanguage()

  const handleSelect = async (lang: SupportedLanguage) => {
    await setLanguage(lang)
    onComplete?.(lang)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <Languages className="mx-auto h-16 w-16 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Select Your Language
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preferred language
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(languages).map(([code, { name, native }]) => (
            <Button
              key={code}
              onClick={() => handleSelect(code as SupportedLanguage)}
              variant="outline"
              size="lg"
              className="w-full h-16 text-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900 transition-all hover:scale-105"
            >
              <div className="flex flex-col items-start w-full">
                <span className="text-xl">{native}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {name}
                </span>
              </div>
            </Button>
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can change this later in settings
        </p>
      </div>
    </div>
  )
}

import { Languages, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/hooks/useI18n'
import type { Language } from '@/i18n/types'
import { LANGUAGES } from '@/i18n/types'

/**
 * 语言切换组件
 * 提供下拉菜单选择语言，支持中文、英文、阿拉伯文
 */
export const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, isLoading } = useI18n()

  const handleLanguageChange = (lang: Language) => {
    if (lang !== currentLanguage) {
      changeLanguage(lang)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 bg-background hover:bg-accent text-foreground"
          disabled={isLoading}
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">
            {LANGUAGES[currentLanguage].flag} {LANGUAGES[currentLanguage].nativeName}
          </span>
          <span className="inline sm:hidden">
            {LANGUAGES[currentLanguage].flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-background border-border"
      >
        {Object.values(LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-accent text-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-sm text-muted-foreground">({lang.name})</span>
            </span>
            {currentLanguage === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher


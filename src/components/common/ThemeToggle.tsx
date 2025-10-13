import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useThemeStore } from '@/store/themeStore'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label="切换主题"
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

export default ThemeToggle

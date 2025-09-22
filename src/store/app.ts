import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { User, UserPreferences } from '@/types'

interface AppState {
  // Theme and UI state
  theme: 'light' | 'dark' | 'system'
  language: string
  sidebarOpen: boolean
  
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Global loading and error states
  isLoading: boolean
  error: string | null
  
  // Notifications
  notifications: Notification[]
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (language: string) => void
  setSidebarOpen: (open: boolean) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  logout: () => void
  reset: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timestamp: number
  autoClose?: boolean
  duration?: number
}

const initialState = {
  theme: 'light' as const,
  language: 'en',
  sidebarOpen: false,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  notifications: [],
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTheme: (theme) => {
        set({ theme })
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement
          root.classList.remove('light', 'dark')
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.add(systemTheme)
          } else {
            root.classList.add(theme)
          }
        }
      },

      setLanguage: (language) => set({ language }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
          autoClose: notification.autoClose ?? true,
          duration: notification.duration ?? 5000,
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove notification if enabled
        if (newNotification.autoClose) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearNotifications: () => set({ notifications: [] }),

      updateUserPreferences: (preferences) => {
        const { user } = get()
        if (!user) return

        const updatedUser: User = {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
          }
        }

        set({ user: updatedUser })

        // Apply theme change if updated
        if (preferences.theme) {
          get().setTheme(preferences.theme)
        }

        // Apply language change if updated
        if (preferences.language) {
          get().setLanguage(preferences.language)
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          notifications: [],
        })
      },

      reset: () => set(initialState),
    }),
    {
      name: 'polyhub-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize theme on app load
if (typeof window !== 'undefined') {
  const store = useAppStore.getState()
  store.setTheme(store.theme)
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleThemeChange = () => {
    const { theme, setTheme } = useAppStore.getState()
    if (theme === 'system') {
      setTheme('system') // This will trigger the theme application logic
    }
  }
  
  mediaQuery.addEventListener('change', handleThemeChange)
}
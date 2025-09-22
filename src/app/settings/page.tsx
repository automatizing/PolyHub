'use client'

import React, { useState } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  Monitor, 
  Globe, 
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app'
import { mockUser } from '@/lib/mock-data'

export default function SettingsPage() {
  const { user, setUser, theme, setTheme, language, setLanguage, updateUserPreferences, addNotification } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize with mock user if no user is logged in
  const currentUser = user || mockUser
  
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email,
    preferences: { ...currentUser.preferences }
  })

  const handleSave = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update user data
    if (user) {
      const updatedUser = {
        ...user,
        username: formData.username,
        email: formData.email,
        preferences: formData.preferences
      }
      setUser(updatedUser)
      updateUserPreferences(formData.preferences)
    }
    
    addNotification({
      type: 'success',
      title: 'Settings saved',
      message: 'Your preferences have been updated successfully.',
    })
    
    setIsLoading(false)
  }

  const handleReset = () => {
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      preferences: { ...currentUser.preferences }
    })
    
    addNotification({
      type: 'info',
      title: 'Settings reset',
      message: 'Your settings have been reset to their previous values.',
    })
  }

  const updatePreference = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }))
  }

  const updateNestedPreference = (section: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section as keyof typeof prev.preferences],
          [key]: value
        }
      }
    }))
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ]

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and platform settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Username</label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Trading Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${currentUser.totalPnl.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">Total P&L</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">${currentUser.totalVolume.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Volume</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{(currentUser.accuracy * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{currentUser.marketsTraded}</div>
                      <div className="text-sm text-muted-foreground">Markets Traded</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value as any)
                          updatePreference('theme', option.value)
                        }}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.preferences.theme === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <option.icon className="h-6 w-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Language
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.preferences.language}
                    onValueChange={(value) => {
                      setLanguage(value)
                      updatePreference('language', value)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email notifications</div>
                        <div className="text-sm text-muted-foreground">Receive notifications via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications.email}
                      onCheckedChange={(checked) => updateNestedPreference('notifications', 'email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Push notifications</div>
                        <div className="text-sm text-muted-foreground">Receive push notifications in browser</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.preferences.notifications.push}
                      onCheckedChange={(checked) => updateNestedPreference('notifications', 'push', checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Notification Types</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Market updates</div>
                        <div className="text-sm text-muted-foreground">Price changes and new markets</div>
                      </div>
                      <Switch
                        checked={formData.preferences.notifications.marketUpdates}
                        onCheckedChange={(checked) => updateNestedPreference('notifications', 'marketUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Price alerts</div>
                        <div className="text-sm text-muted-foreground">When your alert conditions are met</div>
                      </div>
                      <Switch
                        checked={formData.preferences.notifications.priceAlerts}
                        onCheckedChange={(checked) => updateNestedPreference('notifications', 'priceAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Market resolutions</div>
                        <div className="text-sm text-muted-foreground">When markets you're trading in resolve</div>
                      </div>
                      <Switch
                        checked={formData.preferences.notifications.resolutions}
                        onCheckedChange={(checked) => updateNestedPreference('notifications', 'resolutions', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Public profile</div>
                        <div className="text-sm text-muted-foreground">Allow others to view your profile</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.preferences.privacy.showProfile}
                      onCheckedChange={(checked) => updateNestedPreference('privacy', 'showProfile', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Show positions</div>
                        <div className="text-sm text-muted-foreground">Display your current market positions</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.preferences.privacy.showPositions}
                      onCheckedChange={(checked) => updateNestedPreference('privacy', 'showPositions', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Show trade history</div>
                        <div className="text-sm text-muted-foreground">Display your trading activity</div>
                      </div>
                    </div>
                    <Switch
                      checked={formData.preferences.privacy.showTrades}
                      onCheckedChange={(checked) => updateNestedPreference('privacy', 'showTrades', checked)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Data Export</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download your data including trading history, positions, and account information.
                  </p>
                  <Button variant="outline">
                    Download My Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Changes
          </Button>
          <Button onClick={handleSave} loading={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </Layout>
  )
}
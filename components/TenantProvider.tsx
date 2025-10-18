'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface TenantMetadata {
  id: string
  subdomain: string
  customDomain?: string
  name: string
  title: string
  description: string
  logo?: string
  favicon?: string
  tagline?: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  timezone: string
  currency: string
  language: string
}

interface TenantContextType {
  tenant: TenantMetadata | null
  isLoading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  isLoading: true,
  error: null,
})

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenant() {
      try {
        const response = await fetch('/api/tenants/current')
        
        if (!response.ok) {
          throw new Error('Failed to fetch tenant')
        }

        const data = await response.json()
        setTenant(data.tenant)
        
        // Apply branding colors to CSS variables
        if (data.tenant?.colors) {
          document.documentElement.style.setProperty('--color-primary', data.tenant.colors.primary)
          document.documentElement.style.setProperty('--color-secondary', data.tenant.colors.secondary)
          document.documentElement.style.setProperty('--color-accent', data.tenant.colors.accent)
        }
        
        // Update favicon if provided
        if (data.tenant?.favicon) {
          const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link')
          link.type = 'image/x-icon'
          link.rel = 'shortcut icon'
          link.href = data.tenant.favicon
          document.getElementsByTagName('head')[0].appendChild(link)
        }
        
        // Update page title
        if (data.tenant?.title) {
          document.title = data.tenant.title
        }
      } catch (err) {
        console.error('Error fetching tenant:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [])

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  )
}


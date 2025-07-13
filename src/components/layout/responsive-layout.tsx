"use client"

import { ReactNode } from "react"

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
}

export function ResponsiveLayout({ children, className = "" }: ResponsiveLayoutProps) {
  return (
    <div className={`h-full w-full ${className}`}>
      <div className="h-full p-2 sm:p-4 lg:p-6">
        {children}
      </div>
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
}

export function ResponsiveGrid({ children, className = "" }: ResponsiveGridProps) {
  return (
    <div className={`h-full grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 ${className}`}>
      {children}
    </div>
  )
}

interface ResponsiveColumnProps {
  children: ReactNode
  className?: string
}

export function ResponsiveColumn({ 
  children, 
  className = "" 
}: ResponsiveColumnProps) {
  
  return (
    <div className={`${className}`}>
      <div className="h-full">
        {children}
      </div>
    </div>
  )
} 
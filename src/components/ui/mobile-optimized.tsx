"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MobileOptimizedProps {
  children: ReactNode
  className?: string
  mobileClassName?: string
  desktopClassName?: string
}

export function MobileOptimized({ 
  children, 
  className = "", 
  mobileClassName = "", 
  desktopClassName = "" 
}: MobileOptimizedProps) {
  return (
    <div className={cn(
      className,
      mobileClassName,
      `sm:${desktopClassName}`
    )}>
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: ReactNode
  mobileSize?: string
  desktopSize?: string
  className?: string
}

export function ResponsiveText({ 
  children, 
  mobileSize = "text-sm", 
  desktopSize = "text-base", 
  className = "" 
}: ResponsiveTextProps) {
  return (
    <span className={`${mobileSize} sm:${desktopSize} ${className}`}>
      {children}
    </span>
  )
}

interface ResponsiveButtonProps {
  children: ReactNode
  mobileText?: string
  desktopText?: string
  className?: string
}

export function ResponsiveButton({ 
  children, 
  mobileText, 
  desktopText, 
  className = "" 
}: ResponsiveButtonProps) {
  if (mobileText && desktopText) {
    return (
      <span className={className}>
        <span className="sm:hidden">{mobileText}</span>
        <span className="hidden sm:inline">{desktopText}</span>
      </span>
    )
  }
  
  return <span className={className}>{children}</span>
} 
// file: src/components/FoxCard.tsx
import { ReactNode } from 'react'

interface FoxCardProps {
  children: ReactNode
  className?: string
}

export default function FoxCard({ children, className = '' }: FoxCardProps) {
  return (
    <div className={`fox-card ${className}`}>
      {children}
    </div>
  )
}
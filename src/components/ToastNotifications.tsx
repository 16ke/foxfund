'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  duration?: number
}

interface DatabaseNotification {
  id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const checkForNewNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const notifications: DatabaseNotification[] = await response.json()
        const unreadNotifications = notifications.filter(n => !n.read)
        
        // Show toast for new unread notifications
        unreadNotifications.forEach((notification) => {
          if (!toasts.find(t => t.id === notification.id)) {
            showToast({
              id: notification.id,
              type: 'info',
              title: notification.title,
              message: notification.message,
              duration: 5000
            })
          }
        })
      }
    } catch (error) {
      console.error('Failed to check notifications:', error)
    }
  }, [toasts])

  const showToast = (toast: ToastNotification) => {
    setToasts(prev => [...prev, toast])
    
    // Auto remove after duration
    if (toast.duration) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    // Check for new notifications every 10 seconds
    const interval = setInterval(checkForNewNotifications, 10000)
    checkForNewNotifications() // Check immediately on mount
    
    return () => clearInterval(interval)
  }, [checkForNewNotifications])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500'
      case 'warning':
        return 'border-l-yellow-500'
      case 'error':
        return 'border-l-red-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`bg-white dark:bg-gray-800 border-l-4 ${getBorderColor(toast.type)} rounded-lg shadow-lg p-4 min-w-80 max-w-sm border border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {toast.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
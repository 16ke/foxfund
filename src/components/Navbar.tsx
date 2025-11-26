// file: src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, Menu, X, Home, CreditCard, Tags, Target, User, Share2, Bell, BellRing } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Logo from './Logo'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: string
}

export default function Navbar() {
  const { data: session } = useSession()
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    if (sidebarOpen) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds when sidebar is open
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [sidebarOpen])

  const toggleTheme = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length === 0) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: unreadIds,
          read: true
        }),
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60)
      return `${minutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const navigationItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: CreditCard, label: 'Transactions' },
    { href: '/categories', icon: Tags, label: 'Categories' },
    { href: '/budgets', icon: Target, label: 'Budgets' },
    { href: '/budgets/shared', icon: Share2, label: 'Shared Budgets' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      <nav className="nav-bar">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-24 relative">
            {/* Left Side - Menu & Theme Toggle (DESKTOP ONLY) */}
            <div className="absolute left-4 flex items-center gap-3 hidden md:flex">
              {/* Hamburger Menu Button */}
              {session && (
                <button
                  onClick={toggleSidebar}
                  className="theme-toggle"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Centered Title with Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="no-underline hover:scale-105 transition-transform duration-200 flex items-center gap-4">
                {/* Desktop */}
                <div className="hidden md:flex items-center">
                  <Logo className="w-35 h-35" />
                  <h1 className="nav-title-light dark:nav-title-dark text-6xl tracking-widest font-title ml-4">
                    FoxFund
                  </h1>
                </div>
                
                {/* Mobile */}
                <div className="flex md:hidden items-center">
                  <Logo className="w-28 h-28" />
                  <h1 className="nav-title-light dark:nav-title-dark text-4xl tracking-widest font-title ml-2">
                    FoxFund
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right Side - Logout (DESKTOP ONLY) - BACK TO ORIGINAL */}
            <div className="absolute right-4">
              {session && (
                <>
                  {/* Desktop - Full button */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex fox-button"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>Logout</span>
                  </button>
                  
                  {/* Mobile - Icon only (hidden since we moved it to sidebar) */}
                  <button
                    onClick={handleLogout}
                    className="md:hidden fox-button-icon"
                    aria-label="Logout"
                    style={{ display: 'none' }} // Hide mobile logout from top navbar
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Floating Mobile Controls (MOBILE ONLY) - MOVED UP */}
            <div className="absolute left-2 bottom-0 transform translate-y-1/4 md:hidden flex flex-col items-center gap-1 z-40"> {/* CHANGED: translate-y-3/4 → translate-y-1/4 */}
              {/* Theme Toggle - ABOVE */}
              <button
                onClick={toggleTheme}
                className="theme-toggle shadow-lg"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
              
              {/* Hamburger Menu Button - BELOW */}
              {session && (
                <button
                  onClick={toggleSidebar}
                  className="theme-toggle shadow-lg"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - No logout in desktop, only mobile */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-[var(--nav-bg)] border-r-2 border-[var(--nav-border)] 
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        shadow-2xl
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
              Navigation
            </h2>
            <button
              onClick={toggleSidebar}
              className="theme-toggle"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1">
            <ul className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-lg text-[#8B4513] dark:text-[#E6C875] hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors group text-lg"
                    >
                      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="font-button">{item.label}</span>
                    </Link>
                  </li>
                )
              })}

              {/* Notifications */}
              <li>
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="flex items-center gap-4 p-4 rounded-lg text-[#8B4513] dark:text-[#E6C875] hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors group text-lg w-full text-left"
                  >
                    {unreadCount > 0 ? (
                      <div className="relative">
                        <BellRing className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      </div>
                    ) : (
                      <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="font-button">Notifications</span>
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute left-full top-0 ml-2 w-80 bg-[var(--nav-bg)] border-2 border-[var(--nav-border)] rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-[#8B4513] dark:border-[#A86A3D]">
                        <div className="flex justify-between items-center">
                          <h3 className="font-heading text-[#A86A3D] dark:text-[#E6C875] text-lg">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="overflow-y-auto max-h-64">
                        {notificationsLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          <div className="divide-y divide-[#8B4513] dark:divide-[#A86A3D]">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 transition-colors ${
                                  notification.read 
                                    ? 'bg-transparent' 
                                    : 'bg-[#8B4513] bg-opacity-10 dark:bg-[#A86A3D] dark:bg-opacity-10'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className={`font-medium ${
                                      notification.read 
                                        ? 'text-gray-700 dark:text-gray-300' 
                                        : 'text-[#8B4513] dark:text-[#E6C875]'
                                    }`}>
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {formatTime(notification.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex gap-1 flex-shrink-0">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                        title="Mark as read"
                                      >
                                        ✓
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                      title="Delete"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>

              {/* Logout in Sidebar (MOBILE ONLY) - STILL LAST */}
              <li className="md:hidden">
                <button
                  onClick={() => {
                    handleLogout()
                    setSidebarOpen(false)
                  }}
                  className="flex items-center gap-4 p-4 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-colors group text-lg w-full text-left"
                >
                  <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="font-button">Logout</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* User Info at Bottom (DESKTOP ONLY) */}
          {session && (
            <div className="pt-6 border-t border-[#8B4513] dark:border-[#A86A3D] hidden md:block">
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-[#8B4513] dark:bg-[#A86A3D] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#8B4513] dark:text-[#E6C875] truncate">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
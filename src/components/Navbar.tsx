// file: src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut, Menu, X, Home, CreditCard, Tags, Target, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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

  const navigationItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/transactions', icon: CreditCard, label: 'Transactions' },
    { href: '/categories', icon: Tags, label: 'Categories' },
    { href: '/budgets', icon: Target, label: 'Budgets' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <>
      <nav className="nav-bar">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-24 relative">
            {/* Left Side - Menu & Theme Toggle */}
            <div className="absolute left-4 flex items-center gap-3">
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

            {/* Centered Title */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="no-underline hover:scale-105 transition-transform duration-200">
                {/* Desktop */}
                <div className="hidden md:flex items-center">
                  <h1 className="nav-title-light dark:nav-title-dark text-6xl tracking-widest font-title">
                    FoxFund
                  </h1>
                </div>
                
                {/* Mobile */}
                <div className="flex md:hidden items-center">
                  <h1 className="nav-title-light dark:nav-title-dark text-4xl tracking-widest font-title">
                    FoxFund
                  </h1>
                </div>
              </Link>
            </div>

            {/* Right Side - Logout */}
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
                  
                  {/* Mobile - Icon only */}
                  <button
                    onClick={handleLogout}
                    className="md:hidden fox-button-icon"
                    aria-label="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar - Overlay style */}
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
            </ul>
          </nav>

          {/* User Info at Bottom */}
          {session && (
            <div className="pt-6 border-t border-[#8B4513] dark:border-[#A86A3D]">
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
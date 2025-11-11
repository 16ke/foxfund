// file: src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Sun, Moon, LogOut } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [darkMode, setDarkMode] = useState(false)

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

  const handleLogout = () => {
    signOut()
  }

  return (
    <nav className="nav-bar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-24 relative">
          {/* Theme Toggle - Left Side */}
          <div className="absolute left-4">
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

          {/* Centered Title - NO LOGO CIRCLE */}
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

          {/* Logout Button - Right Side */}
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
  )
}
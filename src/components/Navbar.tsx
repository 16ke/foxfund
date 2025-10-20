// file: src/components/Navbar.tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {/* Logo placeholder - we'll add the actual logo later */}
            <div className="w-8 h-8 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#FF8C42] rounded-full"></div>
            <Link href="/" className="flex items-center">
              <h1 className="fox-gradient text-2xl font-title">
                FoxFund
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 dark:text-gray-300 hover:text-[#8B4513] dark:hover:text-[#A86A3D] transition-colors font-button"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-[#8B4513] hover:bg-[#A86A3D] text-white px-4 py-2 rounded-md transition-colors font-button"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 dark:text-gray-300 hover:text-[#8B4513] dark:hover:text-[#A86A3D] transition-colors font-button"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-[#8B4513] hover:bg-[#A86A3D] text-white px-4 py-2 rounded-md transition-colors font-button"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
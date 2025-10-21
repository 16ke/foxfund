// file: src/components/Navbar.tsx
'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-[#F5F1DC] dark:bg-[#333333] border-b-4 border-[#8B4513] dark:border-[#A86A3D]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-20 relative"> {/* Changed from h-24 to h-20 */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="no-underline hover:scale-105 transition-transform duration-200">
              {/* Desktop */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#FF8C42] rounded-full shadow-lg"></div>
                <h1 className="fox-gradient navbar-title-huge tracking-widest">
                  FoxFund
                </h1>
              </div>
              
              {/* Mobile */}
              <div className="flex md:hidden items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#FF8C42] rounded-full shadow-lg"></div>
                <h1 className="fox-gradient navbar-title-large tracking-widest">
                  FoxFund
                </h1>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
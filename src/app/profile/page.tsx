// file: src/app/profile/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Share2, Users } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D]">
            Your Profile
          </h1>
          <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
            Manage your account settings
          </p>
        </div>

        <div className="fox-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Information */}
            <div>
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-1">
                    Name
                  </label>
                  <p className="fox-input bg-opacity-50">
                    {session?.user?.name || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-1">
                    Email
                  </label>
                  <p className="fox-input bg-opacity-50">
                    {session?.user?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-1">
                    Account Type
                  </label>
                  <p className="fox-input bg-opacity-50">
                    {session?.user?.email ? 'Registered User' : 'Guest'}
                  </p>
                </div>
              </div>
            </div>

            {/* App Information */}
            <div>
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
                App Information
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border-2 border-[#8B4513] dark:border-[#A86A3D] bg-[#F8F4E6] dark:bg-[#333333]">
                  <h4 className="font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                    FoxFund Features
                  </h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Track income and expenses</li>
                    <li>• Set category budgets</li>
                    <li>• Visual spending analytics</li>
                    <li>• CSV export functionality</li>
                    <li>• Dark/Light theme</li>
                    <li>• Budget sharing</li>
                  </ul>
                </div>
                
                {/* Shared Budgets Management */}
                <div className="p-4 rounded-lg border-2 border-[#FF8C42] dark:border-[#FF9E64] bg-[#FF8C42] bg-opacity-10">
                  <h4 className="font-heading text-[#A86A3D] dark:text-[#E6C875] mb-3 flex items-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Shared Budgets
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Manage budgets shared with other users and view budgets shared with you.
                  </p>
                  <Link 
                    href="/budgets/shared" 
                    className="fox-button text-sm px-4 py-2 w-full text-center flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Manage Shared Budgets
                  </Link>
                </div>

                <div className="p-4 rounded-lg border-2 border-green-600 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-heading text-green-800 dark:text-green-200 mb-2">
                    Getting Started
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Start by creating categories, then add transactions and set budgets to see your financial insights!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
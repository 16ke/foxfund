// file: src/app/budgets/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Share2, Users, Eye, Edit3, Trash2 } from 'lucide-react'

interface Budget {
  id: string
  amount: number
  month: number
  year: number
  category: {
    id: string
    name: string
    color: string
  }
  isShared?: boolean
  canEdit?: boolean
  sharedBy?: {
    id: string
    name: string
    email: string
  }
  shareId?: string
  sharedWith?: Array<{
    id: string
    user: {
      id: string
      name: string
      email: string
    }
    canEdit: boolean
  }>
}

interface Category {
  id: string
  name: string
  color: string
}

interface User {
  id: string
  name: string
  email: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [sharingBudget, setSharingBudget] = useState<Budget | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [shareCanEdit, setShareCanEdit] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [userSearchResults, setUserSearchResults] = useState<User[]>([])
  const [userSearchLoading, setUserSearchLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, categoriesRes] = await Promise.all([
          fetch('/api/budgets'),
          fetch('/api/categories')
        ])

        if (budgetsRes.ok) {
          const budgetsData = await budgetsRes.json()
          setBudgets(budgetsData)
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (budgetId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the budget for "${categoryName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the budgets list
        const updatedResponse = await fetch('/api/budgets')
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setBudgets(data)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to delete budget')
      }
    } catch {
      alert('Failed to delete budget')
    }
  }

  const handleShareBudget = async (budget: Budget) => {
    if (!shareEmail.trim()) {
      alert('Please enter an email address')
      return
    }

    setShareLoading(true)
    try {
      const response = await fetch(`/api/budgets/${budget.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: shareEmail,
          canEdit: shareCanEdit
        }),
      })

      if (response.ok) {
        await response.json()
        alert(`Budget shared successfully with ${shareEmail}`)
        setSharingBudget(null)
        setShareEmail('')
        setShareCanEdit(false)
        
        // Refresh budgets to show updated shares
        const updatedResponse = await fetch('/api/budgets')
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setBudgets(data)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to share budget')
      }
    } catch {
      alert('Failed to share budget')
    } finally {
      setShareLoading(false)
    }
  }

  const handleUnshareBudget = async (budgetId: string, shareId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName}'s access to this budget?`)) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}/share/${shareId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Budget access removed successfully')
        // Refresh budgets to show updated shares
        const updatedResponse = await fetch('/api/budgets')
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setBudgets(data)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to remove budget access')
      }
    } catch {
      alert('Failed to remove budget access')
    }
  }

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setUserSearchResults([])
      return
    }

    setUserSearchLoading(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const users = await response.json()
        setUserSearchResults(users)
      }
    } catch (error) {
      console.error('User search error:', error)
    } finally {
      setUserSearchLoading(false)
    }
  }

  const selectUserFromSearch = (user: User) => {
    setShareEmail(user.email)
    setUserSearchResults([])
  }

  // Get current month and year
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Separate owned budgets and shared budgets
  const currentOwnedBudgets = budgets.filter(
    budget => budget.month === currentMonth && 
              budget.year === currentYear && 
              !budget.isShared
  )

  const currentSharedBudgets = budgets.filter(
    budget => budget.month === currentMonth && 
              budget.year === currentYear && 
              budget.isShared
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D]">
              Budgets
            </h1>
            <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
              Set monthly spending limits for your categories
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/budgets/shared" 
              className="fox-button text-lg px-6 py-3 bg-[#FF8C42] hover:bg-[#E67A35] border-[#FF8C42] flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Shared Budgets
            </Link>
            <Link 
              href="/budgets/new" 
              className="fox-button text-lg px-6 py-3"
            >
              Set Budget
            </Link>
          </div>
        </div>

        {/* Shared With Me Section */}
        {currentSharedBudgets.length > 0 && (
          <div className="fox-card mb-6">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Shared With Me ({new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear})
            </h2>
            
            <div className="space-y-4">
              {currentSharedBudgets.map((budget) => (
                <div 
                  key={budget.id}
                  className="p-4 rounded-lg border-2 transition-all hover:scale-[1.02]"
                  style={{ 
                    backgroundColor: `${budget.category.color}15`,
                    borderColor: budget.category.color
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: budget.category.color }}
                      />
                      <div>
                        <h3 className="text-xl font-heading font-bold" style={{ color: budget.category.color }}>
                          {budget.category.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Shared by {budget.sharedBy?.name || budget.sharedBy?.email}
                          {!budget.canEdit && ' (View Only)'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                        £{budget.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        per month
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {budget.canEdit ? (
                        <Link 
                          href={`/budgets/${budget.id}/edit`}
                          className="flex items-center gap-1 text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Eye className="w-4 h-4" />
                          View Only
                        </span>
                      )}
                      <button 
                        onClick={() => handleUnshareBudget(budget.id, budget.shareId!, budget.sharedBy?.name || 'this user')}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Budgets Section */}
        <div className="fox-card">
          <div className="mb-6">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
              My Budgets ({new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear})
            </h2>
            
            {currentOwnedBudgets.length > 0 ? (
              <div className="space-y-4">
                {currentOwnedBudgets.map((budget) => (
                  <div 
                    key={budget.id}
                    className="p-4 rounded-lg border-2 transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: `${budget.category.color}15`,
                      borderColor: budget.category.color
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: budget.category.color }}
                        />
                        <div>
                          <h3 className="text-xl font-heading font-bold" style={{ color: budget.category.color }}>
                            {budget.category.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Monthly Budget
                            {budget.sharedWith && budget.sharedWith.length > 0 && (
                              <span className="ml-2 text-[#8B4513] dark:text-[#E6C875]">
                                • Shared with {budget.sharedWith.length} user{budget.sharedWith.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                          £{budget.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          per month
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSharingBudget(budget)}
                          className="flex items-center gap-1 text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <Link 
                          href={`/budgets/${budget.id}/edit`}
                          className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(budget.id, budget.category.name)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  No budgets set for this month
                </p>
                <Link 
                  href="/budgets/new" 
                  className="fox-button text-lg px-6 py-3 inline-block"
                >
                  Set Your First Budget
                </Link>
              </div>
            )}
          </div>

          {/* Available Categories without Budgets */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
                Categories Without Budgets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories
                  .filter(category => 
                    !currentOwnedBudgets.some(budget => budget.category.id === category.id)
                  )
                  .map((category) => (
                    <div 
                      key={category.id}
                      className="p-4 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 text-center transition-all hover:scale-105 hover:border-solid"
                    >
                      <div 
                        className="w-8 h-8 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: category.color }}
                      />
                      <p className="font-medium" style={{ color: category.color }}>
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        No budget set
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Share Budget Modal */}
        {sharingBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="fox-card max-w-md w-full">
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
                Share Budget
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Share &quot;{sharingBudget.category.name}&quot; budget with another user
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                    User Email
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => {
                      setShareEmail(e.target.value)
                      searchUsers(e.target.value)
                    }}
                    placeholder="Enter email address"
                    className="fox-input"
                  />
                  {userSearchLoading && (
                    <p className="text-sm text-gray-500 mt-1">Searching...</p>
                  )}
                  {userSearchResults.length > 0 && (
                    <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-lg max-h-32 overflow-y-auto">
                      {userSearchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUserFromSearch(user)}
                          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="font-medium">{user.name || user.email}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="canEdit"
                    checked={shareCanEdit}
                    onChange={(e) => setShareCanEdit(e.target.checked)}
                    className="rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
                  />
                  <label htmlFor="canEdit" className="text-sm text-gray-700 dark:text-gray-300">
                    Allow this user to edit the budget
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleShareBudget(sharingBudget)}
                    disabled={shareLoading}
                    className="fox-button flex-1 disabled:opacity-50"
                  >
                    {shareLoading ? 'Sharing...' : 'Share Budget'}
                  </button>
                  <button
                    onClick={() => {
                      setSharingBudget(null)
                      setShareEmail('')
                      setShareCanEdit(false)
                      setUserSearchResults([])
                    }}
                    className="px-4 py-2 border-2 border-[#8B4513] dark:border-[#A86A3D] text-[#F8F4E6] dark:text-[#E6C875] rounded-lg hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
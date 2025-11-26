// file: src/app/budgets/shared/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Share2, Users, Eye, Edit3, Trash2, UserX, Settings } from 'lucide-react'

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

interface SharedUser {
  id: string
  name: string
  email: string
  sharedBudgets: Array<{
    budget: Budget
    canEdit: boolean
    shareId: string
  }>
}

export default function SharedBudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([])
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'shared-by-me' | 'shared-users'>('shared-with-me')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const budgetsData = await response.json()
        setBudgets(budgetsData)
        processSharedUsers(budgetsData)
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      setLoading(false)
    }
  }

  const processSharedUsers = (budgetsData: Budget[]) => {
    const userMap = new Map()
    
    // Process budgets shared by me
    const mySharedBudgets = budgetsData.filter(budget => !budget.isShared && budget.sharedWith && budget.sharedWith.length > 0)
    
    mySharedBudgets.forEach(budget => {
      budget.sharedWith?.forEach(share => {
        const user = share.user
        if (!userMap.has(user.id)) {
          userMap.set(user.id, {
            ...user,
            sharedBudgets: []
          })
        }
        userMap.get(user.id).sharedBudgets.push({
          budget,
          canEdit: share.canEdit,
          shareId: share.id
        })
      })
    })

    setSharedUsers(Array.from(userMap.values()))
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
        fetchBudgets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove budget access')
      }
    } catch (error) {
      alert('Failed to remove budget access')
    }
  }

  const handleLeaveSharedBudget = async (budgetId: string, shareId: string) => {
    if (!confirm('Are you sure you want to leave this shared budget?')) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${budgetId}/share/${shareId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('You have left the shared budget')
        fetchBudgets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to leave budget')
      }
    } catch (error) {
      alert('Failed to leave budget')
    }
  }

  const handleUpdatePermissions = async (budgetId: string, shareId: string, canEdit: boolean, userName: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/share/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ canEdit }),
      })

      if (response.ok) {
        alert(`Updated permissions for ${userName}`)
        fetchBudgets()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update permissions')
      }
    } catch (error) {
      alert('Failed to update permissions')
    }
  }

  // Filter budgets
  const sharedWithMe = budgets.filter(budget => budget.isShared)
  const sharedByMe = budgets.filter(budget => !budget.isShared && budget.sharedWith && budget.sharedWith.length > 0)

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
            <Link href="/budgets" className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
              ← Back to Budgets
            </Link>
            <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
              Shared Budgets
            </h1>
            <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
              Manage budgets shared with you and by you
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="fox-card mb-6">
          <div className="flex border-b border-[#8B4513] dark:border-[#A86A3D]">
            <button
              onClick={() => setActiveTab('shared-with-me')}
              className={`px-6 py-3 font-button text-lg border-b-2 transition-colors ${
                activeTab === 'shared-with-me'
                  ? 'border-[#FF8C42] text-[#FF8C42] dark:text-[#FF9E64] dark:border-[#FF9E64]'
                  : 'border-transparent text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64]'
              }`}
            >
              <Eye className="w-5 h-5 inline mr-2" />
              Shared With Me ({sharedWithMe.length})
            </button>
            <button
              onClick={() => setActiveTab('shared-by-me')}
              className={`px-6 py-3 font-button text-lg border-b-2 transition-colors ${
                activeTab === 'shared-by-me'
                  ? 'border-[#FF8C42] text-[#FF8C42] dark:text-[#FF9E64] dark:border-[#FF9E64]'
                  : 'border-transparent text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64]'
              }`}
            >
              <Share2 className="w-5 h-5 inline mr-2" />
              Shared By Me ({sharedByMe.length})
            </button>
            <button
              onClick={() => setActiveTab('shared-users')}
              className={`px-6 py-3 font-button text-lg border-b-2 transition-colors ${
                activeTab === 'shared-users'
                  ? 'border-[#FF8C42] text-[#FF8C42] dark:text-[#FF9E64] dark:border-[#FF9E64]'
                  : 'border-transparent text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64]'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Shared Users ({sharedUsers.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="fox-card">
          {/* Shared With Me */}
          {activeTab === 'shared-with-me' && (
            <div>
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-6">
                Budgets Shared With You
              </h3>
              {sharedWithMe.length > 0 ? (
                <div className="space-y-4">
                  {sharedWithMe.map((budget) => (
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
                            <h4 className="text-xl font-heading font-bold" style={{ color: budget.category.color }}>
                              {budget.category.name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Shared by {budget.sharedBy?.name || budget.sharedBy?.email}
                              {!budget.canEdit && ' • View Only'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                            £{budget.amount.toFixed(2)}
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
                            onClick={() => handleLeaveSharedBudget(budget.id, budget.shareId!)}
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
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    No budgets shared with you yet
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    When other users share budgets with you, they will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shared By Me */}
          {activeTab === 'shared-by-me' && (
            <div>
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-6">
                Budgets You've Shared
              </h3>
              {sharedByMe.length > 0 ? (
                <div className="space-y-6">
                  {sharedByMe.map((budget) => (
                    <div 
                      key={budget.id}
                      className="p-4 rounded-lg border-2"
                      style={{ 
                        backgroundColor: `${budget.category.color}15`,
                        borderColor: budget.category.color
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: budget.category.color }}
                          />
                          <h4 className="text-xl font-heading font-bold" style={{ color: budget.category.color }}>
                            {budget.category.name}
                          </h4>
                        </div>
                        <p className="text-lg font-bold text-[#8B4513] dark:text-[#E6C875]">
                          £{budget.amount.toFixed(2)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Shared with {budget.sharedWith?.length} user{budget.sharedWith?.length !== 1 ? 's' : ''}:
                        </p>
                        {budget.sharedWith?.map((share) => (
                          <div key={share.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{share.user.name || share.user.email}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {share.user.email}
                                {!share.canEdit && ' • View Only'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePermissions(budget.id, share.id, !share.canEdit, share.user.name || share.user.email)}
                                className="flex items-center gap-1 text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                {share.canEdit ? 'Make View Only' : 'Allow Edit'}
                              </button>
                              <button 
                                onClick={() => handleUnshareBudget(budget.id, share.id, share.user.name || share.user.email)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <UserX className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    You haven't shared any budgets yet
                  </p>
                  <Link 
                    href="/budgets" 
                    className="fox-button text-lg px-6 py-3 inline-block"
                  >
                    Share a Budget
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Shared Users */}
          {activeTab === 'shared-users' && (
            <div>
              <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-6">
                Users You Share With
              </h3>
              {sharedUsers.length > 0 ? (
                <div className="space-y-6">
                  {sharedUsers.map((user) => (
                    <div key={user.id} className="p-4 rounded-lg border-2 border-[#8B4513] dark:border-[#A86A3D]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-heading font-bold text-[#A86A3D] dark:text-[#E6C875]">
                            {user.name || user.email}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.sharedBudgets.length} shared budget{user.sharedBudgets.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {user.sharedBudgets.map(({ budget, canEdit, shareId }) => (
                          <div key={shareId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: budget.category.color }}
                              />
                              <div>
                                <p className="font-medium" style={{ color: budget.category.color }}>
                                  {budget.category.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
                                  {!canEdit && ' • View Only'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdatePermissions(budget.id, shareId, !canEdit, user.name || user.email)}
                                className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                              >
                                {canEdit ? 'Make View Only' : 'Allow Edit'}
                              </button>
                              <button 
                                onClick={() => handleUnshareBudget(budget.id, shareId, user.name || user.email)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    You're not sharing with any users yet
                  </p>
                  <Link 
                    href="/budgets" 
                    className="fox-button text-lg px-6 py-3 inline-block"
                  >
                    Start Sharing
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
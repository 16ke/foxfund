// file: src/app/budgets/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
}

interface Category {
  id: string
  name: string
  color: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Loading...
        </div>
      </div>
    )
  }

  // Get current month and year
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Filter budgets for current month
  const currentBudgets = budgets.filter(
    budget => budget.month === currentMonth && budget.year === currentYear
  )

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
          <Link 
            href="/budgets/new" 
            className="fox-button text-lg px-6 py-3"
          >
            Set Budget
          </Link>
        </div>

        <div className="fox-card">
          <div className="mb-6">
            <h2 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
              Current Month ({new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} {currentYear})
            </h2>
            
            {currentBudgets.length > 0 ? (
              <div className="space-y-4">
                {currentBudgets.map((budget) => (
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
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                          ${budget.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          per month
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-800 transition-colors">
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
                    !currentBudgets.some(budget => budget.category.id === category.id)
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
      </div>
    </div>
  )
}
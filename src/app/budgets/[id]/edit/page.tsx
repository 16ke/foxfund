// file: src/app/budgets/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditBudgetPage() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  const [formData, setFormData] = useState({
    amount: '',
    month: '',
    year: ''
  })

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date().toLocaleString('default', { month: 'long' })
  }))

  // Generate year options (current year and next year)
  const currentYear = new Date().getFullYear()
  const yearOptions = [
    currentYear.toString(),
    (currentYear + 1).toString()
  ]

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const response = await fetch(`/api/budgets/${params.id}`)
        if (response.ok) {
          const budgetData = await response.json()
          setBudget(budgetData)
          setFormData({
            amount: Math.abs(budgetData.amount).toString(),
            month: budgetData.month.toString(),
            year: budgetData.year.toString()
          })
        }
      } catch (error) {
        console.error('Failed to fetch budget:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudget()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/budgets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })

      if (response.ok) {
        router.push('/budgets')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update budget')
      }
    } catch (error) {
      alert('Failed to update budget')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return
    }

    try {
      const response = await fetch(`/api/budgets/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/budgets')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete budget')
      }
    } catch (error) {
      alert('Failed to delete budget')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Loading...
        </div>
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Budget not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/budgets" className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
            ← Back to Budgets
          </Link>
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
            Edit Budget
          </h1>
        </div>

        <div className="fox-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Info (read-only) */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Category
              </label>
              <div 
                className="p-4 rounded-lg border-2"
                style={{ 
                  backgroundColor: `${budget.category.color}15`,
                  borderColor: budget.category.color
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <span 
                    className="text-xl font-heading font-bold"
                    style={{ color: budget.category.color }}
                  >
                    {budget.category.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Category cannot be changed
                </p>
              </div>
            </div>

            {/* Budget Amount */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Monthly Budget Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 text-lg">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="fox-input pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Month and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  Month *
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                  className="fox-input"
                >
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {new Date(parseInt(formData.year) || currentYear, parseInt(month.value) - 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="fox-input"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget Preview */}
            <div 
              className="p-4 rounded-lg border-2 transition-all"
              style={{ 
                backgroundColor: `${budget.category.color}15`,
                borderColor: budget.category.color
              }}
            >
              <p className="text-sm text-[#8B4513] dark:text-[#E6C875] text-center mb-2">
                Budget Preview
              </p>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <h3 className="text-xl font-heading font-bold" style={{ color: budget.category.color }}>
                    {budget.category.name}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                  ${parseFloat(formData.amount).toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  per {monthOptions.find(m => m.value === formData.month)?.label} {formData.year}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="fox-button text-lg px-8 py-3 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Budget'}
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-button text-lg"
              >
                Delete
              </button>
              
              <Link
                href="/budgets"
                className="px-8 py-3 border-2 border-[#8B4513] dark:border-[#A86A3D] text-[#F8F4E6] dark:text-[#E6C875] rounded-lg hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors font-button text-lg"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
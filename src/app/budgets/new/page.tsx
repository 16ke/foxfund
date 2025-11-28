// file: src/app/budgets/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
}

export default function NewBudgetPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Get current month and year for default values
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [formData, setFormData] = useState({
    amount: '',
    month: currentMonth.toString(),
    year: currentYear.toString(),
    categoryId: ''
  })

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(currentYear, i).toLocaleString('default', { month: 'long' })
  }))

  // Generate year options (current year and next year)
  const yearOptions = [
    currentYear.toString(),
    (currentYear + 1).toString()
  ]

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
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
        const errorData = await response.json()
        alert(errorData.error || 'Failed to create budget')
      }
    } catch {
      alert('Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId)

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/budgets" className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
            ← Back to Budgets
          </Link>
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
            Set Budget
          </h1>
        </div>

        <div className="fox-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="fox-input"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Amount */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Monthly Budget Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 text-lg">
                  £ {/* CHANGED: $ to £ */}
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
                      {month.label}
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
            {selectedCategory && formData.amount && (
              <div 
                className="p-4 rounded-lg border-2 transition-all"
                style={{ 
                  backgroundColor: `${selectedCategory.color}15`,
                  borderColor: selectedCategory.color
                }}
              >
                <p className="text-sm text-[#8B4513] dark:text-[#E6C875] text-center mb-2">
                  Budget Preview
                </p>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedCategory.color }}
                    />
                    <h3 className="text-xl font-heading font-bold" style={{ color: selectedCategory.color }}>
                      {selectedCategory.name}
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-[#8B4513] dark:text-[#E6C875]">
                    £{parseFloat(formData.amount).toFixed(2)} {/* CHANGED: $ to £ */}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    per {monthOptions.find(m => m.value === formData.month)?.label} {formData.year}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="fox-button text-lg px-8 py-3 disabled:opacity-50"
              >
                {loading ? 'Setting Budget...' : 'Set Budget'}
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
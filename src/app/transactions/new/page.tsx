// file: src/app/transactions/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  color: string
}

export default function NewTransactionPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: '',
    categoryId: ''
  })

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
      const response = await fetch('/api/transactions', {
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
        router.push('/transactions')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create transaction')
      }
    } catch (error) {
      alert('Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/transactions" className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
            ← Back to Transactions
          </Link>
          <h1 className="text-4xl font-heading text-[#8B4513] dark:text-[#E6C875] mt-4">
            Add Transaction
          </h1>
        </div>

        <div className="fox-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="fox-input"
                  placeholder="0.00"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="fox-input"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="fox-input"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="fox-input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="fox-input"
                placeholder="What was this for?"
              />
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                Merchant
              </label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleChange}
                className="fox-input"
                placeholder="Where did this happen?"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-heading text-[#8B4513] dark:text-[#E6C875] mb-2">
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
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

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="fox-button text-lg px-8 py-3 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Transaction'}
              </button>
              <Link
                href="/transactions"
                className="px-8 py-3 border-2 border-[#8B4513] dark:border-[#A86A3D] text-[#8B4513] dark:text-[#E6C875] rounded-lg hover:bg-[#8B4513] hover:text-white dark:hover:bg-[#A86A3D] dark:hover:text-white transition-colors font-button text-lg"
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
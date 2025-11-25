// file: src/app/transactions/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  type: string
  currency: string
  date: string
  description: string | null
  merchant: string | null
  category: { id: string; name: string; color: string } | null
}

interface Category {
  id: string
  name: string
  color: string
}

export default function EditTransactionPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const params = useParams()

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    currency: 'GBP', // CHANGED: Default to GBP
    date: '',
    description: '',
    merchant: '',
    categoryId: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionRes, categoriesRes] = await Promise.all([
          fetch(`/api/transactions/${params.id}`),
          fetch('/api/categories')
        ])

        if (transactionRes.ok) {
          const transactionData = await transactionRes.json()
          setTransaction(transactionData)
          setFormData({
            amount: Math.abs(transactionData.amount).toString(),
            type: transactionData.type,
            currency: transactionData.currency,
            date: transactionData.date.split('T')[0],
            description: transactionData.description || '',
            merchant: transactionData.merchant || '',
            categoryId: transactionData.category?.id || ''
          })
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
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/transactions/${params.id}`, {
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
        router.push('/transactions')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update transaction')
      }
    } catch (error) {
      alert('Failed to update transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/transactions')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete transaction')
      }
    } catch (error) {
      alert('Failed to delete transaction')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
          Transaction not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/transactions" className="text-[#F8F4E6] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors font-button">
            ← Back to Transactions
          </Link>
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D] mt-4">
            Edit Transaction
          </h1>
        </div>

        <div className="fox-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount */}
              <div>
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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
                <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="fox-input"
                >
                  <option value="GBP">GBP (£)</option> {/* CHANGED: GBP first */}
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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
              <label className="block text-lg font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="fox-button text-lg px-8 py-3 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Transaction'}
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors font-button text-lg"
              >
                Delete
              </button>
              
              <Link
                href="/transactions"
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
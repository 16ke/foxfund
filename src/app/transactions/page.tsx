// file: src/app/transactions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, categoriesRes] = await Promise.all([
          fetch('/api/transactions'),
          fetch('/api/categories')
        ])

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(transactionsData)
          setFilteredTransactions(transactionsData)
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

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(transaction =>
        transaction.category?.id === selectedCategory
      )
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(transaction => transaction.type === typeFilter)
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= new Date(dateRange.start)
      )
    }
    if (dateRange.end) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= new Date(dateRange.end)
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, selectedCategory, typeFilter, dateRange])

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the transactions list
        const updatedResponse = await fetch('/api/transactions')
        if (updatedResponse.ok) {
          const data = await updatedResponse.json()
          setTransactions(data)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete transaction')
      }
    } catch (error) {
      alert('Failed to delete transaction')
    }
  }

  const handleExport = async () => {
    try {
      // Build query string from current filters
      const params = new URLSearchParams()
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      if (selectedCategory) params.append('categoryId', selectedCategory)

      const response = await fetch(`/api/transactions/export?${params.toString()}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to export transactions')
      }
    } catch (error) {
      alert('Failed to export transactions')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setTypeFilter('')
    setDateRange({ start: '', end: '' })
  }

  const hasActiveFilters = searchTerm || selectedCategory || typeFilter || dateRange.start || dateRange.end

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
              Transactions
            </h1>
            <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
              Manage your income and expenses
            </p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/transactions/import" 
              className="fox-button text-lg px-6 py-3 bg-[#FF8C42] hover:bg-[#E67A35] border-[#FF8C42]"
            >
              Import CSV
            </Link>
            <Link 
              href="/transactions/new" 
              className="fox-button text-lg px-6 py-3"
            >
              Add Transaction
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="fox-card mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-xl font-heading text-[#A86A3D] dark:text-[#E6C875]">
              Filters & Search
            </h3>
            <div className="flex gap-4 items-center">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={handleExport}
                disabled={filteredTransactions.length === 0}
                className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search descriptions, merchants..."
                className="fox-input text-sm"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="fox-input text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="fox-input text-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="fox-input text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-heading text-[#A86A3D] dark:text-[#E6C875] mb-2">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="fox-input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-[#8B4513] dark:border-[#A86A3D]">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredTransactions.length} of {transactions.length} transactions
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="fox-card">
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#8B4513] dark:border-[#A86A3D]">
                    <th className="text-left p-4 font-heading text-[#A86A3D] dark:text-[#E6C875]">Date</th>
                    <th className="text-left p-4 font-heading text-[#A86A3D] dark:text-[#E6C875]">Description</th>
                    <th className="text-left p-4 font-heading text-[#A86A3D] dark:text-[#E6C875]">Category</th>
                    <th className="text-left p-4 font-heading text-[#A86A3D] dark:text-[#E6C875]">Amount</th>
                    <th className="text-left p-4 font-heading text-[#A86A3D] dark:text-[#E6C875]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-[#8B4513] dark:border-[#A86A3D] last:border-0">
                      <td className="p-4">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{transaction.description || 'No description'}</p>
                          {transaction.merchant && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">{transaction.merchant}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {transaction.category ? (
                          <span 
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: `${transaction.category.color}20`,
                              color: transaction.category.color,
                              border: `1px solid ${transaction.category.color}`
                            }}
                          >
                            {transaction.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-500">Uncategorized</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link 
                            href={`/transactions/${transaction.id}/edit`}
                            className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors"
                          >
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              {transactions.length === 0 ? (
                <>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    No transactions yet
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link 
                      href="/transactions/import" 
                      className="fox-button text-lg px-6 py-3 bg-[#FF8C42] hover:bg-[#E67A35] border-[#FF8C42]"
                    >
                      Import CSV
                    </Link>
                    <Link 
                      href="/transactions/new" 
                      className="fox-button text-lg px-6 py-3"
                    >
                      Add Transaction
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    No transactions match your filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="fox-button text-lg px-6 py-3"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
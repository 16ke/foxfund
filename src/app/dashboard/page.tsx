// file: src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'

interface DashboardData {
  summary: {
    income: number
    expenses: number
    balance: number
  }
  spendingByCategory: Array<{
    categoryId: string | null
    _sum: { amount: number | null }
  }>
  recentTransactions: Array<{
    id: string
    amount: number
    type: string
    description: string | null
    date: string
    category: { name: string; color: string } | null
  }>
  budgets: Array<{
    id: string
    amount: number
    category: { name: string; color: string }
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
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

  const { summary, recentTransactions } = data || {
    summary: { income: 0, expenses: 0, balance: 0 },
    recentTransactions: []
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-[#F8F4E6] dark:text-[#A86A3D]">
            Your Dashboard
          </h1>
          <p className="text-lg text-[#F8F4E6] dark:text-[#8B4513] mt-2">
            Overview of your finances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Total Balance</h3>
            <p className={`text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance.toFixed(2)}
            </p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Income</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">
              ${summary.income.toFixed(2)}
            </p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Expenses</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">
              ${summary.expenses.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">Spending by Category</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              {data?.spendingByCategory.length ? 'Pie Chart - Data Ready' : 'No spending data yet'}
            </div>
          </div>
          
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">Monthly Trend</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Line Chart - Coming Soon
            </div>
          </div>
        </div>

        <div className="fox-card mt-6">
          <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">Recent Transactions</h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 border-b border-[#8B4513] dark:border-[#A86A3D] last:border-0">
                  <div>
                    <p className="font-medium">{transaction.description || 'No description'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.category?.name || 'Uncategorized'} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No transactions yet. Add your first transaction to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
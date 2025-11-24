// file: src/app/transactions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  type: string
  currency: string
  date: string
  description: string | null
  merchant: string | null
  category: { name: string; color: string } | null
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (response.ok) {
          const data = await response.json()
          setTransactions(data)
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-heading text-[#8B4513] dark:text-[#E6C875]">
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
            <h1 className="text-4xl font-heading text-[#8B4513] dark:text-[#E6C875]">
              Transactions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Manage your income and expenses
            </p>
          </div>
          <Link 
            href="/transactions/new" 
            className="fox-button text-lg px-6 py-3"
          >
            Add Transaction
          </Link>
        </div>

        <div className="fox-card">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#8B4513] dark:border-[#A86A3D]">
                    <th className="text-left p-4 font-heading text-[#8B4513] dark:text-[#E6C875]">Date</th>
                    <th className="text-left p-4 font-heading text-[#8B4513] dark:text-[#E6C875]">Description</th>
                    <th className="text-left p-4 font-heading text-[#8B4513] dark:text-[#E6C875]">Category</th>
                    <th className="text-left p-4 font-heading text-[#8B4513] dark:text-[#E6C875]">Amount</th>
                    <th className="text-left p-4 font-heading text-[#8B4513] dark:text-[#E6C875]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
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
                          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="text-[#8B4513] dark:text-[#E6C875] hover:text-[#FF8C42] dark:hover:text-[#FF9E64] transition-colors">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
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
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                No transactions yet
              </p>
              <Link 
                href="/transactions/new" 
                className="fox-button text-lg px-6 py-3 inline-block"
              >
                Add Your First Transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
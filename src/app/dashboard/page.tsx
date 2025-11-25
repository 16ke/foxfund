// file: src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface DashboardData {
  summary: {
    income: number
    expenses: number
    balance: number
  }
  spendingByCategory: Array<{
    categoryId: string | null
    categoryName: string
    amount: number
    color: string
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
  monthlyTrend: Array<{
    month: string
    income: number
    expenses: number
  }>
  budgetProgress: Array<{
    budgetId: string
    categoryId: string
    categoryName: string
    categoryColor: string
    budgetAmount: number
    spent: number
    remaining: number
    percentage: number
    status: 'good' | 'warning' | 'over'
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
          
          // Transform spendingByCategory for the chart
          const transformedSpending = dashboardData.spendingByCategory.map((item: any) => ({
            categoryId: item.categoryId,
            categoryName: item.category?.name || 'Uncategorized',
            amount: Math.abs(item._sum?.amount || 0),
            color: item.category?.color || '#6B7280'
          }))

          setData({
            ...dashboardData,
            spendingByCategory: transformedSpending,
            monthlyTrend: dashboardData.monthlyTrend || [],
            budgetProgress: dashboardData.budgetProgress || []
          })
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

  const { summary, spendingByCategory, recentTransactions, monthlyTrend, budgetProgress } = data || {
    summary: { income: 0, expenses: 0, balance: 0 },
    spendingByCategory: [],
    recentTransactions: [],
    monthlyTrend: [],
    budgetProgress: []
  }

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, categoryName
  }: any) => {
    if (percent === 0) return null
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const hasSpendingData = spendingByCategory.some(item => item.amount > 0)
  const hasTrendData = monthlyTrend.some(item => item.income > 0 || item.expenses > 0)
  const hasBudgetProgress = budgetProgress.length > 0

  const getProgressBarColor = (status: string, categoryColor: string) => {
    switch (status) {
      case 'over': return '#EF4444' // Red
      case 'warning': return '#F59E0B' // Amber
      default: return categoryColor
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'over': return 'Over Budget'
      case 'warning': return 'Almost There'
      default: return 'On Track'
    }
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

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Total Balance</h3>
            <p className={`text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              £{summary.balance.toFixed(2)}
            </p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Income</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">
              £{summary.income.toFixed(2)}
            </p>
          </div>
          
          <div className="fox-card text-center">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875]">Expenses</h3>
            <p className="text-3xl font-bold mt-2 text-red-600">
              £{summary.expenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Budget Progress Section */}
        {hasBudgetProgress && (
          <div className="fox-card mb-6">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
              Budget Progress
            </h3>
            <div className="space-y-4">
              {budgetProgress.map((budget) => (
                <div key={budget.budgetId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.categoryColor }}
                      />
                      <span className="font-medium" style={{ color: budget.categoryColor }}>
                        {budget.categoryName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        budget.status === 'over' ? 'text-red-600' : 
                        budget.status === 'warning' ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {getStatusText(budget.status)}
                      </span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        £{budget.spent.toFixed(2)} of £{budget.budgetAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, budget.percentage)}%`,
                        backgroundColor: getProgressBarColor(budget.status, budget.categoryColor)
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Spent: £{budget.spent.toFixed(2)}</span>
                    <span>Remaining: £{budget.remaining.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Category Pie Chart */}
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
              Spending by Category
            </h3>
            {hasSpendingData ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingByCategory.filter(item => item.amount > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend 
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color, fontSize: '12px' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg text-center">
                  No spending data yet
                </p>
                <p className="text-sm text-center mt-2">
                  Add some transactions to see your spending breakdown
                </p>
              </div>
            )}
          </div>
          
          {/* Monthly Trend Line Chart */}
          <div className="fox-card">
            <h3 className="text-2xl font-heading text-[#A86A3D] dark:text-[#E6C875] mb-4">
              Monthly Trend
            </h3>
            {hasTrendData ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      name="Income" 
                      dot={{ fill: '#10B981', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={2} 
                      name="Expenses" 
                      dot={{ fill: '#EF4444', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <div className="text-6xl mb-4">📈</div>
                <p className="text-lg text-center">
                  No trend data yet
                </p>
                <p className="text-sm text-center mt-2">
                  Add transactions over multiple months to see trends
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
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
                    {transaction.type === 'income' ? '+' : '-'}£{Math.abs(transaction.amount).toFixed(2)}
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
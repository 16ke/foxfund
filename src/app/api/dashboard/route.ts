import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month and year for calculations
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get user's transactions for the current month
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: session.user.id,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Get user's budgets for current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear
      },
      include: { category: true }
    })

    // Get spending by category for current month - FIXED VERSION
    const spendingByCategoryRaw = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.user.id,
        type: 'expense',
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      },
      _sum: {
        amount: true
      }
    })

    // Get all categories to map the category data
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id }
    })

    // Transform spending data with category information
    const spendingByCategory = spendingByCategoryRaw.map(item => {
      const category = categories.find(cat => cat.id === item.categoryId)
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Uncategorized',
        amount: Math.abs(item._sum?.amount || 0),
        color: category?.color || '#6B7280' // Default grey for uncategorized
      }
    })

    // Add uncategorized transactions (transactions without category)
    const uncategorizedSpending = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'expense',
        categoryId: null,
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      },
      _sum: {
        amount: true
      }
    })

    if (uncategorizedSpending._sum.amount && Math.abs(uncategorizedSpending._sum.amount) > 0) {
      spendingByCategory.push({
        categoryId: null,
        categoryName: 'Uncategorized',
        amount: Math.abs(uncategorizedSpending._sum.amount),
        color: '#6B7280'
      })
    }

    // Get recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5
    })

    // Get monthly trend data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyTrend = await prisma.transaction.groupBy({
      by: ['date'],
      where: {
        userId: session.user.id,
        date: {
          gte: sixMonthsAgo
        }
      },
      _sum: {
        amount: true
      }
    })

    // Transform monthly data for the chart
    const monthlyData = monthlyTrend.reduce((acc: Array<{ month: string; income: number; expenses: number }>, item) => {
      const monthYear = new Date(item.date).toLocaleString('default', { month: 'short', year: 'numeric' })
      const existing = acc.find(m => m.month === monthYear)
      
      if (existing) {
        if (item._sum.amount! > 0) {
          existing.income += item._sum.amount!
        } else {
          existing.expenses += Math.abs(item._sum.amount!)
        }
      } else {
        acc.push({
          month: monthYear,
          income: item._sum.amount! > 0 ? item._sum.amount! : 0,
          expenses: item._sum.amount! < 0 ? Math.abs(item._sum.amount!) : 0
        })
      }
      
      return acc
    }, [])

    // Calculate budget progress
    const budgetProgress = await Promise.all(
      budgets.map(async (budget) => {
        const categorySpending = await prisma.transaction.aggregate({
          where: {
            userId: session.user.id,
            categoryId: budget.categoryId,
            type: 'expense',
            date: {
              gte: new Date(currentYear, currentMonth - 1, 1),
              lt: new Date(currentYear, currentMonth, 1)
            }
          },
          _sum: {
            amount: true
          }
        })

        const spent = Math.abs(categorySpending._sum.amount || 0)
        const remaining = Math.max(0, budget.amount - spent)
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        const status = percentage >= 100 ? 'over' : percentage >= 80 ? 'warning' : 'good'

        return {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          categoryColor: budget.category.color,
          budgetAmount: budget.amount,
          spent,
          remaining,
          percentage: Math.min(100, percentage),
          status
        }
      })
    )

    return NextResponse.json({
      summary: {
        income,
        expenses,
        balance: income - expenses
      },
      spendingByCategory,
      recentTransactions,
      budgets,
      monthlyTrend: monthlyData,
      budgetProgress
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
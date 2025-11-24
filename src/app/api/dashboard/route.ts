// file: src/app/api/dashboard/route.ts
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

    // Get spending by category for current month
    const spendingByCategory = await prisma.transaction.groupBy({
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

    // Get recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5
    })

    return NextResponse.json({
      summary: {
        income,
        expenses,
        balance: income - expenses
      },
      spendingByCategory,
      recentTransactions,
      budgets
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
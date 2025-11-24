// file: src/app/api/budgets/route.ts
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

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Get budgets error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, month, year, categoryId } = await request.json()

    // Check if budget already exists for this category, month, and year
    const existingBudget = await prisma.budget.findUnique({
      where: {
        categoryId_month_year: {
          categoryId,
          month,
          year
        }
      }
    })

    if (existingBudget) {
      return NextResponse.json(
        { error: 'Budget already exists for this category and period' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        categoryId,
        userId: session.user.id,
      },
      include: { category: true }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Create budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
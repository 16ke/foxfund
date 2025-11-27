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

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get user's goals for current month
    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, targetAmount, month, year } = await request.json()

    // Check if goal already exists for this month/year with same title
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: session.user.id,
        title,
        month: parseInt(month),
        year: parseInt(year)
      }
    })

    if (existingGoal) {
      return NextResponse.json(
        { error: 'Goal with this title already exists for this month' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        title,
        targetAmount: parseFloat(targetAmount),
        month: parseInt(month),
        year: parseInt(year),
        userId: session.user.id,
        currentAmount: 0,
        completed: false
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Create goal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
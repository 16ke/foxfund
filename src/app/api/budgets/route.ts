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

    // Get both owned budgets and shared budgets
    const [ownedBudgets, sharedBudgets] = await Promise.all([
      // Budgets created by the user
      prisma.budget.findMany({
        where: { userId: session.user.id },
        include: { 
          category: true,
          sharedWith: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }]
      }),
      // Budgets shared with the user
      prisma.budgetShare.findMany({
        where: { userId: session.user.id },
        include: {
          budget: {
            include: {
              category: true,
              user: {
                select: { id: true, name: true, email: true }
              },
              sharedWith: {
                include: {
                  user: {
                    select: { id: true, name: true, email: true }
                  }
                }
              }
            }
          }
        },
        orderBy: [{ budget: { year: 'desc' } }, { budget: { month: 'desc' } }]
      })
    ])

    // Transform shared budgets to match owned budget format with share info
    const transformedSharedBudgets = sharedBudgets.map(share => ({
      ...share.budget,
      isShared: true,
      sharedBy: share.budget.user,
      canEdit: share.canEdit,
      shareId: share.id
    }))

    const allBudgets = [
      ...ownedBudgets.map(budget => ({ ...budget, isShared: false, canEdit: true })),
      ...transformedSharedBudgets
    ]

    return NextResponse.json(allBudgets)
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

    // Check if budget already exists for this category, month, and year for this user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
        userId: session.user.id
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
      include: { 
        category: true,
        sharedWith: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json({ ...budget, isShared: false, canEdit: true })
  } catch (error) {
    console.error('Create budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
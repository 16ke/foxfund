// file: src/app/api/budgets/[id]/share/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, canEdit = false } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Verify the budget exists and belongs to the user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id // Only owner can share
      },
      include: { 
        category: true,
        user: {
          select: { name: true, email: true }
        }
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Find the user to share with
    const userToShareWith = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!userToShareWith) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Can't share with yourself
    if (userToShareWith.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot share with yourself' }, { status: 400 })
    }

    // Check if budget is already shared with this user
    const existingShare = await prisma.budgetShare.findUnique({
      where: {
        budgetId_userId: {
          budgetId: params.id,
          userId: userToShareWith.id
        }
      }
    })

    if (existingShare) {
      return NextResponse.json({ error: 'Budget already shared with this user' }, { status: 400 })
    }

    // Create the share
    const budgetShare = await prisma.budgetShare.create({
      data: {
        budgetId: params.id,
        userId: userToShareWith.id,
        canEdit: Boolean(canEdit)
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        budget: {
          include: {
            category: true
          }
        }
      }
    })

    // Create notification for the user being shared with
    await prisma.notification.create({
      data: {
        userId: userToShareWith.id,
        type: 'budget_shared',
        title: 'Budget Shared With You',
        message: `${budget.user.name || budget.user.email} shared the "${budget.category.name}" budget with you${canEdit ? ' with edit permissions' : ' (view only)'}.`,
        data: {
          budgetId: budget.id,
          budgetName: budget.category.name,
          sharedById: session.user.id,
          sharedByName: budget.user.name || budget.user.email,
          canEdit: canEdit
        }
      }
    })

    return NextResponse.json({
      message: 'Budget shared successfully',
      share: budgetShare
    })
  } catch (error) {
    console.error('Share budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the budget exists and belongs to the user
    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id // Only owner can view shares
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Get all shares for this budget
    const shares = await prisma.budgetShare.findMany({
      where: { budgetId: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(shares)
  } catch (error) {
    console.error('Get budget shares error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
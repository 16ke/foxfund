// file: src/app/api/budgets/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns the budget or has it shared
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
        OR: [
          { userId: session.user.id }, // User owns the budget
          { 
            sharedWith: {
              some: { userId: session.user.id } // Budget is shared with user
            }
          }
        ]
      },
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
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Check if this is a shared budget and get permissions
    const budgetShare = await prisma.budgetShare.findFirst({
      where: {
        budgetId: id,
        userId: session.user.id
      }
    })

    const response = {
      ...budget,
      isShared: budget.userId !== session.user.id,
      canEdit: budgetShare?.canEdit || budget.userId === session.user.id,
      shareId: budgetShare?.id
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, month, year } = await request.json()

    // Check permissions - user must own budget or have edit permissions
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
        OR: [
          { userId: session.user.id }, // User owns the budget
          { 
            sharedWith: {
              some: { 
                userId: session.user.id,
                canEdit: true // User has edit permissions
              }
            }
          }
        ]
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found or no edit permissions' }, { status: 404 })
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: id },
      data: {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
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

    // Check if this is a shared budget
    const budgetShare = await prisma.budgetShare.findFirst({
      where: {
        budgetId: id,
        userId: session.user.id
      }
    })

    const response = {
      ...updatedBudget,
      isShared: updatedBudget.userId !== session.user.id,
      canEdit: budgetShare?.canEdit || updatedBudget.userId === session.user.id,
      shareId: budgetShare?.id
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Update budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only budget owner can delete (not shared users, even with edit permissions)
    const budget = await prisma.budget.findFirst({
      where: {
        id: id,
        userId: session.user.id // Must be the owner
      }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found or insufficient permissions' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Delete budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
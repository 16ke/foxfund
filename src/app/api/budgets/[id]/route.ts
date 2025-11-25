// file: src/app/api/budgets/[id]/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: { category: true }
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Get budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, month, year } = await request.json()

    // Verify the budget belongs to the user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const budget = await prisma.budget.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
      },
      include: { category: true }
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error('Update budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the budget belongs to the user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingBudget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Delete budget error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
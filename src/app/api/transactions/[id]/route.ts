// file: src/app/api/transactions/[id]/route.ts
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: { category: true }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Get transaction error:', error)
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

    const { amount, type, currency, date, description, merchant, categoryId } = await request.json()

    // Verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        type,
        currency: currency || 'GBP', // CHANGED: Default to GBP instead of USD
        date: new Date(date),
        description,
        merchant,
        categoryId: categoryId || null,
      },
      include: { category: true }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Update transaction error:', error)
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

    // Verify the transaction belongs to the user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
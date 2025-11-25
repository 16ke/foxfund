// file: src/app/api/transactions/route.ts
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

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, type, currency, date, description, merchant, categoryId } = await request.json()

    const transaction = await prisma.transaction.create({
      data: {
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        type,
        currency: currency || 'GBP', // CHANGED: Default to GBP instead of USD
        date: new Date(date),
        description,
        merchant,
        categoryId: categoryId || null,
        userId: session.user.id,
      },
      include: { category: true }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
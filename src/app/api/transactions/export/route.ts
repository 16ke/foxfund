// file: src/app/api/transactions/export/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')

    // Build where clause for filters
    const where: Prisma.TransactionWhereInput = { userId: session.user.id }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    // Convert to CSV
    const csvHeaders = 'Date,Description,Merchant,Category,Type,Amount,Currency\n'
    
    const csvRows = transactions.map(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0]
      const description = `"${(transaction.description || '').replace(/"/g, '""')}"`
      const merchant = `"${(transaction.merchant || '').replace(/"/g, '""')}"`
      const category = `"${(transaction.category?.name || 'Uncategorized').replace(/"/g, '""')}"`
      const type = transaction.type
      const amount = Math.abs(transaction.amount).toFixed(2)
      const currency = transaction.currency

      return `${date},${description},${merchant},${category},${type},${amount},${currency}`
    }).join('\n')

    const csv = csvHeaders + csvRows

    // Create response with CSV file
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
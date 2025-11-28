// file: src/app/api/transactions/import/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'

interface CSVTransaction {
  date: string
  amount: string
  type: string
  description?: string
  merchant?: string
  category?: string
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 })
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const fileContent = await file.text()

    let records: CSVTransaction[]
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
    } catch {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 })
    }

    if (!records.length) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 })
    }

    // Validate required columns
    const requiredColumns = ['date', 'amount', 'type']
    const firstRecord = records[0]
    for (const column of requiredColumns) {
      if (!(column in firstRecord)) {
        return NextResponse.json({ error: `Missing required column: ${column}` }, { status: 400 })
      }
    }

    let importedCount = 0
    const errors: string[] = []

    for (const [index, record] of records.entries()) {
      try {
        // Validate required fields
        if (!record.date || !record.amount || !record.type) {
          errors.push(`Row ${index + 2}: Missing required fields`)
          continue
        }

        // Validate date
        const transactionDate = new Date(record.date)
        if (isNaN(transactionDate.getTime())) {
          errors.push(`Row ${index + 2}: Invalid date format. Use YYYY-MM-DD`)
          continue
        }

        // Validate amount
        const amount = parseFloat(record.amount)
        if (isNaN(amount) || amount <= 0) {
          errors.push(`Row ${index + 2}: Amount must be a positive number`)
          continue
        }

        // Validate type
        if (!['income', 'expense'].includes(record.type.toLowerCase())) {
          errors.push(`Row ${index + 2}: Type must be "income" or "expense"`)
          continue
        }

        // Find or create category
        let categoryId: string | null = null
        if (record.category) {
          const existingCategory = await prisma.category.findFirst({
            where: {
              userId: session.user.id,
              name: { equals: record.category, mode: 'insensitive' }
            }
          })

          if (existingCategory) {
            categoryId = existingCategory.id
          } else {
            // Create new category with a default color
            const newCategory = await prisma.category.create({
              data: {
                name: record.category,
                color: '#6B7280', // Default gray color
                userId: session.user.id,
              }
            })
            categoryId = newCategory.id
          }
        }

        // Check for duplicate transaction (same date, amount, and description)
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            userId: session.user.id,
            date: transactionDate,
            amount: record.type.toLowerCase() === 'expense' ? -amount : amount,
            description: record.description || null,
          }
        })

        if (existingTransaction) {
          errors.push(`Row ${index + 2}: Duplicate transaction skipped`)
          continue
        }

        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: record.type.toLowerCase() === 'expense' ? -amount : amount,
            type: record.type.toLowerCase(),
            currency: 'GBP', // Default to GBP
            date: transactionDate,
            description: record.description || null,
            merchant: record.merchant || null,
            categoryId,
            userId: session.user.id,
          }
        })

        importedCount++

      } catch {
        errors.push(`Row ${index + 2}: Processing error`)
      }
    }

    return NextResponse.json({
      imported: importedCount,
      total: records.length,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0 ? 
        `Imported ${importedCount} of ${records.length} transactions with ${errors.length} errors` :
        `Successfully imported ${importedCount} transactions`
    })

  } catch (error) {
    console.error('CSV import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
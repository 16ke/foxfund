import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.budgetShare.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.category.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@foxfund.com',
      name: 'Demo User',
      password: await hash('demo123', 12),
      emailVerified: new Date(),
    },
  })

  console.log('👤 Created demo user')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Food & Dining', color: '#8B4513', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Transport', color: '#D4AF37', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Shopping', color: '#FF8C42', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Entertainment', color: '#A86A3D', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Bills & Utilities', color: '#E6C875', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Salary', color: '#10B981', userId: demoUser.id }
    }),
    prisma.category.create({
      data: { name: 'Freelance', color: '#3B82F6', userId: demoUser.id }
    }),
  ])

  console.log('📂 Created categories')

  // Get category IDs with proper typing
  const foodCategory = categories.find((c: { name: string }) => c.name === 'Food & Dining')!
  const transportCategory = categories.find((c: { name: string }) => c.name === 'Transport')!
  const shoppingCategory = categories.find((c: { name: string }) => c.name === 'Shopping')!
  const entertainmentCategory = categories.find((c: { name: string }) => c.name === 'Entertainment')!
  const billsCategory = categories.find((c: { name: string }) => c.name === 'Bills & Utilities')!
  const salaryCategory = categories.find((c: { name: string }) => c.name === 'Salary')!
  const freelanceCategory = categories.find((c: { name: string }) => c.name === 'Freelance')!

  // Create transactions for current month only (simpler approach)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Sample UK transactions for current month
  const transactions = [
    // Income
    { amount: 2800, type: 'income', description: 'Monthly Salary', merchant: 'Tech Corp Ltd', categoryId: salaryCategory.id },
    { amount: 450, type: 'income', description: 'Freelance Project', merchant: 'Design Studio', categoryId: freelanceCategory.id },
    
    // Food & Dining
    { amount: 45.50, type: 'expense', description: 'Weekly Groceries', merchant: 'Tesco', categoryId: foodCategory.id },
    { amount: 28.75, type: 'expense', description: 'Dinner out', merchant: 'Pizza Express', categoryId: foodCategory.id },
    
    // Transport
    { amount: 125.00, type: 'expense', description: 'Monthly Travelcard', merchant: 'TfL', categoryId: transportCategory.id },
    
    // Shopping
    { amount: 89.99, type: 'expense', description: 'New shoes', merchant: 'Nike', categoryId: shoppingCategory.id },
    
    // Entertainment
    { amount: 15.00, type: 'expense', description: 'Cinema tickets', merchant: 'Odeon', categoryId: entertainmentCategory.id },
    
    // Bills
    { amount: 120.00, type: 'expense', description: 'Electricity Bill', merchant: 'British Gas', categoryId: billsCategory.id },
  ]

  // Create transactions with dates in current month
  for (const transaction of transactions) {
    const day = Math.floor(Math.random() * 28) + 1 // Random day in month
    const date = new Date(currentYear, currentMonth, day)
    
    await prisma.transaction.create({
      data: {
        amount: transaction.type === 'income' ? transaction.amount : -transaction.amount,
        type: transaction.type,
        currency: 'GBP',
        date: date,
        description: transaction.description,
        merchant: transaction.merchant,
        categoryId: transaction.categoryId,
        userId: demoUser.id,
      },
    })
  }

  console.log('💰 Created transactions')

  // Create budgets for current month
  await prisma.budget.createMany({
    data: [
      { amount: 300, month: currentMonth + 1, year: currentYear, categoryId: foodCategory.id, userId: demoUser.id },
      { amount: 200, month: currentMonth + 1, year: currentYear, categoryId: transportCategory.id, userId: demoUser.id },
      { amount: 150, month: currentMonth + 1, year: currentYear, categoryId: shoppingCategory.id, userId: demoUser.id },
    ],
  })

  console.log('🎯 Created budgets')
  console.log('✅ Seed completed!')
  console.log('')
  console.log('📋 Demo Account:')
  console.log('   Email: demo@foxfund.com')
  console.log('   Password: demo123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
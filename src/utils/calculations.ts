interface Budget {
  amount: number
  categoryId: string
}

interface Transaction {
  type: string
  amount: number
  categoryId?: string
}

export interface BudgetProgress {
  spent: number
  remaining: number
  percentage: number
}

export function calculateBudgetProgress(budget: Budget, transactions: Transaction[]): BudgetProgress {
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const spent = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0))
  const remaining = Math.max(0, budget.amount - spent)
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

  return {
    spent: Math.round(spent * 100) / 100,
    remaining: Math.round(remaining * 100) / 100,
    percentage: Math.round(percentage * 100) / 100
  }
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}
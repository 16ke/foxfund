// file: src/utils/__tests__/calculations.test.ts
import { calculateBudgetProgress, formatCurrency } from '../calculations'

// Mock data - COMPLETELY FAKE, never touches real database
const mockBudget = {
  id: 'test-budget-1',
  amount: 1000,
  month: 11,
  year: 2024,
  category: { name: 'Food', color: '#FF0000' }
}

const mockTransactions = [
  { id: 'test-tx-1', amount: -150, type: 'expense' },
  { id: 'test-tx-2', amount: -200, type: 'expense' },
  { id: 'test-tx-3', amount: 500, type: 'income' } // Income should be ignored for expense calculation
]

describe('Budget Calculations', () => {
  test('calculates budget progress correctly', () => {
    const progress = calculateBudgetProgress(mockBudget, mockTransactions)
    
    expect(progress.spent).toBe(350) // 150 + 200
    expect(progress.remaining).toBe(650) // 1000 - 350
    expect(progress.percentage).toBe(35) // (350 / 1000) * 100
  })

  test('handles zero budget amount', () => {
    const zeroBudget = { ...mockBudget, amount: 0 }
    const progress = calculateBudgetProgress(zeroBudget, mockTransactions)
    
    expect(progress.percentage).toBe(0)
  })

  test('formats currency correctly for GBP', () => {
    expect(formatCurrency(25.5, 'GBP')).toBe('£25.50')
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00')
    expect(formatCurrency(-50.25, 'GBP')).toBe('-£50.25')
  })
})
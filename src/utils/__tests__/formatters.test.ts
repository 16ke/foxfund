// file: src/utils/__tests__/formatters.test.ts
import { formatCurrency } from '../calculations'

describe('Formatters', () => {
  test('formats different currencies correctly', () => {
    expect(formatCurrency(25.5, 'GBP')).toBe('£25.50')
    expect(formatCurrency(1000, 'USD')).toBe('US$1,000.00')
    expect(formatCurrency(500, 'EUR')).toBe('€500.00')
  })

  test('handles negative amounts', () => {
    expect(formatCurrency(-50.25, 'GBP')).toBe('-£50.25')
    expect(formatCurrency(-100, 'USD')).toBe('-US$100.00')
  })

  test('handles zero amounts', () => {
    expect(formatCurrency(0, 'GBP')).toBe('£0.00')
    expect(formatCurrency(0, 'USD')).toBe('US$0.00')
  })
})
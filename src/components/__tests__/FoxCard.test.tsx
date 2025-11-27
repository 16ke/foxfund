// file: src/components/__tests__/FoxCard.test.tsx
import { render, screen } from '@testing-library/react'
import FoxCard from '../FoxCard'

// Simple component for testing
function TestFoxCard() {
  return (
    <FoxCard>
      <h2>Test Card</h2>
      <p>This is a test card content</p>
    </FoxCard>
  )
}

describe('FoxCard Component', () => {
  test('renders children content', () => {
    render(<TestFoxCard />)
    
    expect(screen.getByText('Test Card')).toBeDefined()
    expect(screen.getByText('This is a test card content')).toBeDefined()
  })

  test('has correct styling classes', () => {
    const { container } = render(<TestFoxCard />)
    
    const card = container.firstChild
    expect(card).toBeDefined()
    if (card && card instanceof Element) {
      expect(card.classList.contains('fox-card')).toBe(true)
    }
  })
})
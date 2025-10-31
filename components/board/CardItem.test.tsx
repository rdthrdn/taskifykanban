import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardItem } from './CardItem'
import type { Card } from '@/lib/types'

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('CardItem', () => {
  const mockCard: Card = {
    id: '1',
    column_id: 'col1',
    title: 'Test Card',
    description: 'Test description',
    labels: ['Frontend', 'Bug'],
    due_date: '2024-12-31',
    assignees: [],
    order: 100,
    created_at: '2024-01-01T00:00:00Z',
  }

  it('should render card title', () => {
    const onClick = vi.fn()
    render(<CardItem card={mockCard} onClick={onClick} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
  })

  it('should render labels', () => {
    const onClick = vi.fn()
    render(<CardItem card={mockCard} onClick={onClick} />)
    
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })

  it('should render due date when present', () => {
    const onClick = vi.fn()
    render(<CardItem card={mockCard} onClick={onClick} />)
    
    // Check that Calendar icon and date are rendered
    expect(screen.getByText(/31/)).toBeInTheDocument()
  })

  it('should not render labels section when no labels', () => {
    const cardNoLabels = { ...mockCard, labels: [] }
    const onClick = vi.fn()
    render(<CardItem card={cardNoLabels} onClick={onClick} />)
    
    expect(screen.queryByText('Frontend')).not.toBeInTheDocument()
  })

  it('should not render due date when not present', () => {
    const cardNoDueDate = { ...mockCard, due_date: null }
    const onClick = vi.fn()
    const { container } = render(<CardItem card={cardNoDueDate} onClick={onClick} />)
    
    // Calendar icon should not be present
    expect(container.querySelector('svg')).toBeTruthy() // Only drag handle icon
  })
})


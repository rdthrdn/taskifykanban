'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Card as CardType } from '@/lib/types'

interface CardItemProps {
  card: CardType
  onClick: () => void
}

export function CardItem({ card, onClick }: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring rounded"
            aria-label="Drag handle"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex-1" onClick={onClick}>
            <h4 className="text-sm font-medium mb-2">{card.title}</h4>
            {card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((label, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            {card.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(card.due_date).toLocaleDateString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}


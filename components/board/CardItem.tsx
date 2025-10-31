'use client'

import * as React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, Users } from 'lucide-react'
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
      <Card className="glass-card border-none p-3 cursor-pointer transition-all hover:-translate-y-0.5">
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
            <h4 className="text-sm font-semibold mb-2 text-white/90">
              {card.title}
            </h4>
            {card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((label, idx) => (
                  <Badge key={idx} className="text-xs bg-white/10 border border-white/20 text-white/80">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              {card.due_date && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(card.due_date).toLocaleDateString('id-ID')}
                  </span>
                </div>
              )}
              {card.assignees && card.assignees.length > 0 && (
                <div className="flex items-center -space-x-2">
                  {card.assignees.slice(0, 3).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center"
                      title={`Assignee ${idx + 1}`}
                    >
                      <Users className="h-3 w-3 text-primary" />
                    </div>
                  ))}
                  {card.assignees.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                      +{card.assignees.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}


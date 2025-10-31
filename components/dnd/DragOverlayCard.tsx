'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Card as CardType } from '@/lib/types'

interface DragOverlayCardProps {
  card: CardType
}

export function DragOverlayCard({ card }: DragOverlayCardProps) {
  return (
    <Card className="p-3 shadow-lg opacity-90 cursor-grabbing">
      <h4 className="text-sm font-medium mb-2">{card.title}</h4>
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.map((label, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}


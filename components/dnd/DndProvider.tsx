'use client'

import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'

interface DndProviderProps {
  children: React.ReactNode
  onDragStart?: (event: DragStartEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  overlay?: React.ReactNode
}

export function DndProvider({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  overlay,
}: DndProviderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag harus >= 8px untuk activate
      },
    })
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay>{overlay}</DragOverlay>
    </DndContext>
  )
}


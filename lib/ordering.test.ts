import { describe, it, expect } from 'vitest'
import { calcOrder, needsNormalization, normalizeOrders } from './ordering'

describe('ordering utilities', () => {
  describe('calcOrder', () => {
    it('should return middle value when both prev and next exist', () => {
      const result = calcOrder(100, 300)
      expect(result).toBe(200)
    })

    it('should handle non-even gaps', () => {
      const result = calcOrder(100, 201)
      expect(result).toBe(150)
    })

    it('should return prev + 100 when only prev exists', () => {
      const result = calcOrder(200, undefined)
      expect(result).toBe(300)
    })

    it('should return next - 100 when only next exists', () => {
      const result = calcOrder(undefined, 200)
      expect(result).toBe(100)
    })

    it('should return 100 when both are undefined (empty list)', () => {
      const result = calcOrder(undefined, undefined)
      expect(result).toBe(100)
    })

    it('should handle multiple insertions between same items', () => {
      // Sisip berulang di tengah
      let prev = 100
      let next = 200
      
      const order1 = calcOrder(prev, next) // 150
      expect(order1).toBe(150)
      
      const order2 = calcOrder(prev, order1) // 125
      expect(order2).toBe(125)
      
      const order3 = calcOrder(order2, order1) // 137
      expect(order3).toBe(137)
      
      // Semua order berbeda
      expect(new Set([prev, order1, order2, order3, next]).size).toBe(5)
    })
  })

  describe('needsNormalization', () => {
    it('should return false for empty array', () => {
      expect(needsNormalization([])).toBe(false)
    })

    it('should return false for single item', () => {
      expect(needsNormalization([{ id: '1', order: 100 }])).toBe(false)
    })

    it('should return false when gaps are sufficient (>= 10)', () => {
      const items = [
        { id: '1', order: 100 },
        { id: '2', order: 200 },
        { id: '3', order: 300 },
      ]
      expect(needsNormalization(items)).toBe(false)
    })

    it('should return true when any gap is < 10', () => {
      const items = [
        { id: '1', order: 100 },
        { id: '2', order: 105 }, // gap = 5
        { id: '3', order: 300 },
      ]
      expect(needsNormalization(items)).toBe(true)
    })

    it('should handle unsorted items', () => {
      const items = [
        { id: '3', order: 300 },
        { id: '1', order: 100 },
        { id: '2', order: 105 }, // gap dengan id:1 = 5
      ]
      expect(needsNormalization(items)).toBe(true)
    })
  })

  describe('normalizeOrders', () => {
    it('should reassign orders with gap 100', () => {
      const items = [
        { id: '1', order: 100 },
        { id: '2', order: 105 },
        { id: '3', order: 110 },
      ]
      
      const result = normalizeOrders(items)
      
      expect(result).toEqual([
        { id: '1', order: 100 },
        { id: '2', order: 200 },
        { id: '3', order: 300 },
      ])
    })

    it('should maintain order even when input is unsorted', () => {
      const items = [
        { id: '3', order: 300 },
        { id: '1', order: 100 },
        { id: '2', order: 200 },
      ]
      
      const result = normalizeOrders(items)
      
      expect(result).toEqual([
        { id: '1', order: 100 },
        { id: '2', order: 200 },
        { id: '3', order: 300 },
      ])
    })

    it('should handle single item', () => {
      const items = [{ id: '1', order: 500 }]
      const result = normalizeOrders(items)
      expect(result).toEqual([{ id: '1', order: 100 }])
    })

    it('should handle empty array', () => {
      const result = normalizeOrders([])
      expect(result).toEqual([])
    })
  })
})


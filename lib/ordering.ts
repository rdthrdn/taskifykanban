/**
 * Ordering utility untuk drag-and-drop dengan gap-based integer ordering
 * Gunakan gap 100 untuk setiap item: 100, 200, 300, dst.
 */

const DEFAULT_GAP = 100

/**
 * Kalkulasi order baru untuk item yang di-insert
 * @param prev - order item sebelumnya (undefined jika di awal)
 * @param next - order item sesudahnya (undefined jika di akhir)
 * @returns order baru untuk item
 */
export function calcOrder(prev?: number, next?: number): number {
  // Jika ada prev dan next, ambil tengahnya
  if (prev !== undefined && next !== undefined) {
    return Math.floor((prev + next) / 2)
  }
  
  // Jika hanya ada prev (insert di akhir)
  if (prev !== undefined && next === undefined) {
    return prev + DEFAULT_GAP
  }
  
  // Jika hanya ada next (insert di awal)
  if (prev === undefined && next !== undefined) {
    return next - DEFAULT_GAP
  }
  
  // Jika tidak ada keduanya (list kosong)
  return DEFAULT_GAP
}

/**
 * Check apakah perlu normalisasi (jika gap terlalu kecil)
 * @param items - array items dengan property order
 * @returns true jika ada gap < 10
 */
export function needsNormalization<T extends { order: number }>(items: T[]): boolean {
  if (items.length < 2) return false
  
  const sorted = [...items].sort((a, b) => a.order - b.order)
  
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].order - sorted[i - 1].order
    if (gap < 10) {
      return true
    }
  }
  
  return false
}

/**
 * Normalisasi order untuk items, reassign dengan gap 100
 * @param items - array items dengan property order dan id
 * @returns array baru dengan order yang sudah dinormalisasi
 */
export function normalizeOrders<T extends { id: string; order: number }>(
  items: T[]
): Array<{ id: string; order: number }> {
  const sorted = [...items].sort((a, b) => a.order - b.order)
  
  return sorted.map((item, index) => ({
    id: item.id,
    order: (index + 1) * DEFAULT_GAP,
  }))
}


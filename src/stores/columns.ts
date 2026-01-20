import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Column, NewColumn } from '@/shared/types/columns'

export const useColumnsStore = defineStore('columns', () => {
  const columns = ref<Column[]>([])
  const nextId = ref(1)

  // Default width for new columns
  const DEFAULT_WIDTH = 200

  /**
   * Add a new column to the board
   */
  const addColumn = (newColumn: NewColumn): Column => {
    const column: Column = {
      id: nextId.value++,
      name: newColumn.name,
      type: newColumn.type,
      settings: newColumn.settings || '',
      width: newColumn.width || DEFAULT_WIDTH,
      position: columns.value.length,
    }

    columns.value.push(column)
    return column
  }

  /**
   * Update an existing column
   */
  const updateColumn = (
    columnId: number,
    updates: {
      name?: string
      position?: number
      width?: number
    },
  ): Column | null => {
    const column = columns.value.find((c) => c.id === columnId)

    if (!column) {
      console.warn(`Column with id ${columnId} not found`)
      return null
    }

    // Update allowed properties
    if (updates.name !== undefined) {
      column.name = updates.name
    }
    if (updates.width !== undefined) {
      column.width = updates.width
    }
    if (updates.position !== undefined) {
      // Reorder columns if position changed
      const oldPosition = column.position
      const newPosition = updates.position

      if (oldPosition !== newPosition) {
        // Remove column from old position
        columns.value.splice(oldPosition, 1)
        // Insert at new position
        columns.value.splice(newPosition, 0, column)
        // Update all positions
        reorderPositions()
      }
    }

    return column
  }

  /**
   * Edit column settings
   */
  const editColumnSettings = (columnId: number, settings: string): Column | null => {
    const column = columns.value.find((c) => c.id === columnId)

    if (!column) {
      console.warn(`Column with id ${columnId} not found`)
      return null
    }

    column.settings = settings
    return column
  }

  /**
   * Delete a column
   */
  const deleteColumn = (columnId: number): boolean => {
    const index = columns.value.findIndex((c) => c.id === columnId)

    if (index === -1) {
      console.warn(`Column with id ${columnId} not found`)
      return false
    }

    columns.value.splice(index, 1)
    reorderPositions()
    return true
  }

  /**
   * Reorder all column positions to be sequential
   */
  const reorderPositions = () => {
    columns.value.forEach((column, index) => {
      column.position = index
    })
  }

  /**
   * Get a column by ID
   */
  const getColumnById = (columnId: number): Column | undefined => {
    return columns.value.find((c) => c.id === columnId)
  }

  /**
   * Get all columns sorted by position
   */
  const getColumnsSorted = (): Column[] => {
    return [...columns.value].sort((a, b) => a.position - b.position)
  }

  /**
   * Move a column to a new position
   */
  const moveColumn = (columnId: number, newPosition: number): boolean => {
    const column = columns.value.find((c) => c.id === columnId)

    if (!column) {
      console.warn(`Column with id ${columnId} not found`)
      return false
    }

    if (newPosition < 0 || newPosition >= columns.value.length) {
      console.warn(`Invalid position ${newPosition}`)
      return false
    }

    const oldPosition = column.position

    // Remove from old position
    columns.value.splice(oldPosition, 1)
    // Insert at new position
    columns.value.splice(newPosition, 0, column)
    // Update all positions
    reorderPositions()

    return true
  }

  /**
   * Clear all columns
   */
  const clearColumns = () => {
    columns.value = []
    nextId.value = 1
  }

  /**
   * Initialize with default columns
   */
  const initializeDefaultColumns = () => {
    clearColumns()

    addColumn({ name: 'Nombre', type: 'text' })
    addColumn({ name: 'Estado', type: 'status' })
    addColumn({ name: 'Fecha', type: 'date' })
  }

  return {
    // State
    columns,

    // Getters
    getColumnById,
    getColumnsSorted,

    // Actions
    addColumn,
    updateColumn,
    editColumnSettings,
    deleteColumn,
    moveColumn,
    clearColumns,
    initializeDefaultColumns,
  }
})

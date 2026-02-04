import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Column, NewColumn } from '@/shared/types/columns'

export const useColumnsStore = defineStore('columns', () => {
  const columns = ref<Column[]>([])
  const DEFAULT_WIDTH = 200

  const addColumn = (newColumn: NewColumn): Column => {
    const column: Column = {
      ...newColumn,
      columnWidth: DEFAULT_WIDTH,
    }

    columns.value.push(column)
    return column
  }

  const updateColumn = (
    columnId: string,
    updates: {
      name?: string
      position?: number
      columnWidth?: number
      settings?: string | null
      type?: Column['type']
      boardId?: string
    },
  ): Column | null => {
    const column = columns.value.find((c) => c.id === columnId)

    if (!column) {
      console.warn(`Column with id ${columnId} not found`)
      return null
    }

    if (updates.name !== undefined) {
      column.name = updates.name
    }

    if (updates.columnWidth !== undefined) {
      column.columnWidth = updates.columnWidth
    }

    if (updates.settings !== undefined) {
      column.settings = updates.settings
    }

    if (updates.type !== undefined) {
      column.type = updates.type
    }

    if (updates.boardId !== undefined) {
      column.boardId = updates.boardId
    }

    if (updates.position !== undefined) {
      const oldPosition = column.position
      const newPosition = updates.position

      if (oldPosition !== newPosition) {
        columns.value.splice(oldPosition, 1)
        columns.value.splice(newPosition, 0, column)
        reorderPositions()
      }
    }

    return column
  }

  const editColumnSettings = (columnId: string, settings: string | null): Column | null => {
    const column = columns.value.find((c) => c.id === columnId)

    if (!column) {
      console.warn(`Column with id ${columnId} not found`)
      return null
    }

    column.settings = settings
    return column
  }

  const deleteColumn = (columnId: string): boolean => {
    const index = columns.value.findIndex((c) => c.id === columnId)

    if (index === -1) {
      console.warn(`Column with id ${columnId} not found`)
      return false
    }

    columns.value.splice(index, 1)
    reorderPositions()
    return true
  }

  const reorderPositions = () => {
    columns.value.forEach((column, index) => {
      column.position = index
    })
  }

  const getColumnById = (columnId: string): Column | undefined => {
    return columns.value.find((c) => c.id === columnId)
  }

  const getColumnsSorted = (): Column[] => {
    return [...columns.value].sort((a, b) => a.position - b.position)
  }

  const moveColumn = (columnId: string, newPosition: number): boolean => {
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

  const setColumns = (newColumns: Column[]) => {
    columns.value = [...newColumns]
  }

  return {
    columns,
    getColumnById,
    getColumnsSorted,
    addColumn,
    updateColumn,
    editColumnSettings,
    deleteColumn,
    moveColumn,
    setColumns,
  }
})

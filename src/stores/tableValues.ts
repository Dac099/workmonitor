import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TableValuesByColumn } from '@/modules/boards/types/tableValues'

export const useTableValuesStore = defineStore('tableValues', () => {
  const tableValuesByColumn = ref<TableValuesByColumn[]>([])

  const setTableValues = (data: TableValuesByColumn[]) => {
    tableValuesByColumn.value = data
  }

  const clearTableValues = () => {
    tableValuesByColumn.value = []
  }

  const initializeColumn = (
    columnId: string,
    columnName: string = '',
    defaultValues: { id: number; name: string; value: string }[] = [],
  ) => {
    if (!tableValuesByColumn.value.find((c) => c.columnId === columnId)) {
      tableValuesByColumn.value.push({
        columnId,
        columnName,
        values: defaultValues.map((v) => ({
          id: v.id.toString(),
          itemId: '',
          columnId,
          value: v.value,
        })),
      })
    }
  }

  return {
    tableValuesByColumn,
    setTableValues,
    clearTableValues,
    initializeColumn,
  }
})

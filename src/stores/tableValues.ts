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

  return {
    tableValuesByColumn,
    setTableValues,
    clearTableValues,
  }
})

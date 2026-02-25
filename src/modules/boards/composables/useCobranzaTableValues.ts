import { ref } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import type { Board } from '../types/board'
import type { TableValuesByColumn } from '../types/tableValues'

const tableValuesByColumn = ref<TableValuesByColumn[]>([])
const isLoading = ref(false)
const requestError = ref('')
let hasLoaded = false
let activeRequest: Promise<void> | null = null

const loadCobranzaTableValues = async (force = false) => {
  if (hasLoaded && !force) {
    return
  }

  if (activeRequest) {
    return activeRequest
  }

  activeRequest = (async () => {
    isLoading.value = true
    requestError.value = ''

    try {
      const boardResponse = await fetch(`${API_BASE_URL}/boards/cobranza`)

      if (!boardResponse.ok) {
        throw new Error('No fue posible obtener el tablero de cobranza')
      }

      const board = (await boardResponse.json()) as Board
      const tableValuesResponse = await fetch(
        `${API_BASE_URL}/tableValues/status/board/${encodeURIComponent(board.id)}`,
      )

      if (!tableValuesResponse.ok) {
        throw new Error('No fue posible obtener los estados del tablero de cobranza')
      }

      const tableValues = (await tableValuesResponse.json()) as TableValuesByColumn[]
      tableValuesByColumn.value = tableValues
      hasLoaded = true
    } catch {
      tableValuesByColumn.value = []
      requestError.value = 'Error al obtener las etiquetas de estado del tablero de cobranza'
    } finally {
      isLoading.value = false
      activeRequest = null
    }
  })()

  return activeRequest
}

export const useCobranzaTableValues = () => {
  return {
    tableValuesByColumn,
    isLoading,
    requestError,
    loadCobranzaTableValues,
  }
}

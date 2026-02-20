import { ref } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import type { TableValue } from '../types/tableValues'

interface SaveTableValueOptions {
  valueId?: string
  itemId: string
  columnId: string
  value: string
  onSuccess?: (response: TableValue) => void
}

/**
 * Composable for managing TableValue API operations (create & update)
 * Handles the common pattern of optimistic updates followed by API calls
 */
export function useTableValueAPI() {
  const isSaving = ref(false)

  const save = async (options: SaveTableValueOptions) => {
    const { valueId, itemId, columnId, value, onSuccess } = options
    isSaving.value = true

    try {
      if (valueId) {
        await fetch(`${API_BASE_URL}/tableValues/${valueId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value }),
        })
      } else {
        const response = await fetch(`${API_BASE_URL}/tableValues/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId,
            columnId,
            value,
          }),
        })

        if (response.ok) {
          const created = await response.json()
          onSuccess?.(created)
        }
      }
    } catch (error) {
      console.error('Failed to save table value', error)
    } finally {
      isSaving.value = false
    }
  }

  return { isSaving, save }
}

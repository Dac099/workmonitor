import { ref, computed } from 'vue'
import type { Value } from '../types/values'

interface LocalValueDefaults {
  itemId: string
  columnId: string
  columnType: string
}

/**
 * Composable for managing local optimistic updates of table values
 * Maintains a local copy for optimistic UI updates while preserving props fallback
 */
export function useLocalValue(
  initialValue: Value | undefined,
  defaults: LocalValueDefaults,
) {
  const localValue = ref<Value | undefined>(
    initialValue ? { ...initialValue } : undefined,
  )

  /**
   * Update the local value's value field
   */
  const updateLocal = (newValue: string) => {
    if (localValue.value) {
      localValue.value.value = newValue
    } else {
      localValue.value = {
        id: '', // Temporary ID, will be set when API response arrives
        itemId: defaults.itemId,
        columnId: defaults.columnId,
        value: newValue,
        columnType: defaults.columnType,
      }
    }
  }

  /**
   * Set the ID after successful creation
   */
  const setId = (id: string) => {
    if (localValue.value) {
      localValue.value.id = id
    }
  }

  /**
   * Get current value, falling back to initial props if no local value exists
   */
  const getValue = computed(() => localValue.value)

  return {
    localValue,
    updateLocal,
    setId,
    getValue,
  }
}

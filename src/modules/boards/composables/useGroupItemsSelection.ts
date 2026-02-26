import { ref } from 'vue'

export const useGroupItemsSelection = () => {
  const itemsSelected = ref<string[]>([])

  const setSelectedItems = (itemIds: string[]) => {
    itemsSelected.value = [...new Set(itemIds)]
  }

  const isItemSelected = (itemId: string): boolean => {
    return itemsSelected.value.includes(itemId)
  }

  const ensureItemSelected = (itemId: string) => {
    if (isItemSelected(itemId)) {
      return
    }

    itemsSelected.value = [...itemsSelected.value, itemId]
  }

  const handleItemSelection = (itemId: string, isSelected: boolean) => {
    if (isSelected) {
      ensureItemSelected(itemId)
      return
    }

    itemsSelected.value = itemsSelected.value.filter((id) => id !== itemId)
  }

  const resetSelection = () => {
    itemsSelected.value = []
  }

  return {
    itemsSelected,
    setSelectedItems,
    isItemSelected,
    ensureItemSelected,
    handleItemSelection,
    resetSelection,
  }
}

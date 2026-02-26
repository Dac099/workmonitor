import { API_BASE_URL } from '@/utils/contants'
import type {
  CopyItemPayload,
  DeleteItemsPayload,
  GroupItemsRef,
  MoveItemsPayload,
} from '../types/groupDetail'

interface UseGroupItemActionsOptions {
  localItems: GroupItemsRef
  getSelectedItemIds: () => string[]
  ensureItemSelected: (itemId: string) => void
  resetSelection: () => void
}

export const useGroupItemActions = ({
  localItems,
  getSelectedItemIds,
  ensureItemSelected,
  resetSelection,
}: UseGroupItemActionsOptions) => {
  const removeSelectedItemsFromLocalList = () => {
    const selectedIds = getSelectedItemIds()
    localItems.value = localItems.value.filter((item) => !selectedIds.includes(item.id))
  }

  const handleItemDeleted = async (itemId: string) => {
    ensureItemSelected(itemId)

    try {
      const payload: DeleteItemsPayload = {
        itemIds: [...getSelectedItemIds()],
      }

      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return
      }

      removeSelectedItemsFromLocalList()
      resetSelection()
    } catch (error) {
      console.error('Error al eliminar items:', error)
    }
  }

  const handleItemsMove = async (itemId: string, targetGroupId: string) => {
    ensureItemSelected(itemId)

    try {
      const payload: MoveItemsPayload = {
        itemIds: [...getSelectedItemIds()],
        targetGroupId,
      }

      const response = await fetch(`${API_BASE_URL}/items/move`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return
      }

      removeSelectedItemsFromLocalList()
      resetSelection()
    } catch (error) {
      console.error('Error al mover item:', error)
    }
  }

  const handleItemsCopy = async (itemId: string, targetGroupId: string) => {
    ensureItemSelected(itemId)

    try {
      const payload: CopyItemPayload = {
        itemIds: [...getSelectedItemIds()],
        targetGroupId,
      }

      const response = await fetch(`${API_BASE_URL}/items/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return
      }

      resetSelection()
    } catch (error) {
      console.error('Error al copiar item:', error)
    }
  }

  return {
    handleItemDeleted,
    handleItemsMove,
    handleItemsCopy,
  }
}

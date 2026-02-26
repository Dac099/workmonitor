import { ref } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import type { GetSubItemsResponse, SubItemRow } from '../types/groupDetail'
import type { SubItemDetail } from '../types/items'
import type { Value } from '../types/values'

const mapSubItemValues = (subItem: SubItemDetail): Array<Value> => {
  return subItem.values.map((value) => ({
    id: value.id,
    itemId: value.itemId ?? subItem.id,
    columnId: value.columnId,
    value: value.value ?? '',
    columnType: value.columnType,
  }))
}

const mapSubItemsResponse = (subItems: GetSubItemsResponse): Array<SubItemRow> => {
  return subItems.map((subItem) => ({
    id: subItem.id,
    itemParent: subItem.itemParent,
    name: subItem.name,
    values: mapSubItemValues(subItem),
  }))
}

export const useGroupSubitems = () => {
  const expandedItemIds = ref<string[]>([])
  const subitemsByItemId = ref<Record<string, Array<SubItemRow>>>({})
  const loadingSubitemsByItemId = ref<Record<string, boolean>>({})

  const resetSubitemsState = () => {
    expandedItemIds.value = []
    subitemsByItemId.value = {}
    loadingSubitemsByItemId.value = {}
  }

  const isItemExpanded = (itemId: string): boolean => {
    return expandedItemIds.value.includes(itemId)
  }

  const isSubitemsLoading = (itemId: string): boolean => {
    return loadingSubitemsByItemId.value[itemId] ?? false
  }

  const getSubitems = (itemId: string): Array<SubItemRow> => {
    return subitemsByItemId.value[itemId] ?? []
  }

  const appendSubitem = (itemId: string, subitem: SubItemRow) => {
    const currentSubitems = getSubitems(itemId)
    const nextSubitems = currentSubitems.some((currentSubitem) => currentSubitem.id === subitem.id)
      ? currentSubitems.map((currentSubitem) =>
          currentSubitem.id === subitem.id ? subitem : currentSubitem,
        )
      : [...currentSubitems, subitem]

    subitemsByItemId.value = {
      ...subitemsByItemId.value,
      [itemId]: nextSubitems,
    }
  }

  const removeSubitem = (itemId: string, subitemId: string) => {
    const nextSubitems = getSubitems(itemId).filter((subitem) => subitem.id !== subitemId)

    subitemsByItemId.value = {
      ...subitemsByItemId.value,
      [itemId]: nextSubitems,
    }
  }

  const updateSubitemName = (itemId: string, subitemId: string, name: string) => {
    const nextSubitems = getSubitems(itemId).map((subitem) =>
      subitem.id === subitemId ? { ...subitem, name } : subitem,
    )

    subitemsByItemId.value = {
      ...subitemsByItemId.value,
      [itemId]: nextSubitems,
    }
  }

  const fetchSubitemsByItemId = async (itemId: string) => {
    if (subitemsByItemId.value[itemId] || isSubitemsLoading(itemId)) {
      return
    }

    loadingSubitemsByItemId.value = {
      ...loadingSubitemsByItemId.value,
      [itemId]: true,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subitems/parent/${itemId}`)

      if (!response.ok) {
        return
      }

      const data: unknown = await response.json()
      const mappedSubItems = Array.isArray(data)
        ? mapSubItemsResponse(data as GetSubItemsResponse)
        : []

      subitemsByItemId.value = {
        ...subitemsByItemId.value,
        [itemId]: mappedSubItems,
      }
    } catch (error) {
      console.error('Error al cargar subitems:', error)
    } finally {
      loadingSubitemsByItemId.value = {
        ...loadingSubitemsByItemId.value,
        [itemId]: false,
      }
    }
  }

  const toggleSubitems = async (itemId: string) => {
    if (isItemExpanded(itemId)) {
      expandedItemIds.value = expandedItemIds.value.filter((id) => id !== itemId)
      return
    }

    expandedItemIds.value = [...expandedItemIds.value, itemId]
    await fetchSubitemsByItemId(itemId)
  }

  return {
    expandedItemIds,
    subitemsByItemId,
    loadingSubitemsByItemId,
    resetSubitemsState,
    isItemExpanded,
    isSubitemsLoading,
    getSubitems,
    appendSubitem,
    removeSubitem,
    updateSubitemName,
    toggleSubitems,
  }
}

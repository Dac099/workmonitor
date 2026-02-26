import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Group, GroupDetail } from '../types/groups'
import type { Board } from '../types/board'
import { API_BASE_URL } from '@/utils/contants'
import { useColumnsStore } from '@/stores/columns'
import { useTableValuesStore } from '@/stores/tableValues'

export const useBoardView = () => {
  const route = useRoute()
  const boardData = ref<Board | null>(null)
  const groupsList = ref<Group[]>([])
  const isLoading = ref(true)
  const isError = ref('')
  const columnsStore = useColumnsStore()
  const tableValuesStore = useTableValuesStore()
  const showSidebar = ref(window.innerWidth > 768)
  const selectedGroupId = ref<string | null>(null)
  const groupToRender = ref<GroupDetail | null>(null)
  const isGroupLoading = ref(false)
  const groupError = ref('')
  const highlightedItemId = ref<string | null>(null)
  let highlightTimeout: number | null = null

  const fetchInitialData = async () => {
    const [columnsResponse, groupsResponse, boardResponse, tableValuesResponse] = await Promise.all(
      [
        fetch(`${API_BASE_URL}/columns/board/${route.params.boardId}`),
        fetch(`${API_BASE_URL}/groups/board/${route.params.boardId}`),
        fetch(`${API_BASE_URL}/boards/${route.params.boardId}`),
        fetch(`${API_BASE_URL}/tableValues/status/board/${route.params.boardId}`),
      ],
    )

    if (!columnsResponse.ok || !groupsResponse.ok || !boardResponse.ok || !tableValuesResponse.ok) {
      isLoading.value = false
      isError.value = 'Ocurrió un errror al obtener los datos.'
      return
    }

    const [parsedColumns, parsedGroups, parsedBoard, parsedTableValues] = await Promise.all([
      columnsResponse.json(),
      groupsResponse.json(),
      boardResponse.json(),
      tableValuesResponse.json(),
    ])

    boardData.value = parsedBoard
    groupsList.value = parsedGroups
    columnsStore.setColumns(parsedColumns)
    tableValuesStore.setTableValues(parsedTableValues)

    if (!selectedGroupId.value && parsedGroups.length > 0) {
      if (route.query.groupId && typeof route.query.groupId === 'string') {
        selectedGroupId.value = route.query.groupId
      } else {
        selectedGroupId.value = parsedGroups[0].id
      }
    }

    if (route.query.searchItemId && typeof route.query.searchItemId === 'string') {
      setHighlightedItem(route.query.searchItemId)
    }

    isLoading.value = false
  }

  const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value
  }

  const handleErrorAction = () => {
    isError.value = ''
    isLoading.value = true
    fetchInitialData()
  }

  const handleSelectGroup = (groupId: string) => {
    selectedGroupId.value = groupId
  }

  const clearHighlight = () => {
    highlightedItemId.value = null
  }

  const setHighlightedItem = (itemId: string) => {
    highlightedItemId.value = itemId

    // Clear any existing timeout
    if (highlightTimeout) {
      clearTimeout(highlightTimeout)
    }

    // Set a new timeout to clear the highlight after 5 seconds
    highlightTimeout = setTimeout(() => {
      clearHighlight()
    }, 20000)
  }

  const fetchGroupDetail = async (groupId: string) => {
    if (!groupId) {
      groupToRender.value = null
      return
    }

    isGroupLoading.value = true
    groupError.value = ''

    try {
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}`)

      if (!response.ok) {
        groupError.value = 'Ocurrió un error al obtener los datos del grupo'
        groupToRender.value = null
        return
      }

      groupToRender.value = await response.json()
    } catch {
      groupError.value = 'Ocurrió un error al obtener los datos del grupo'
      groupToRender.value = null
    } finally {
      isGroupLoading.value = false
    }
  }

  const handleGroupErrorAction = () => {
    if (!selectedGroupId.value) return
    fetchGroupDetail(selectedGroupId.value)
  }

  const handleGroupsChange = (groups: Group[]) => {
    groupsList.value = groups

    if (!groupsList.value.find((group) => group.id === selectedGroupId.value)) {
      selectedGroupId.value = groupsList.value[0]?.id ?? null
    }
  }

  watch(
    () => route.params.boardId,
    () => {
      isLoading.value = true
      isError.value = ''
      groupError.value = ''
      groupToRender.value = null
      fetchInitialData()
    },
    { immediate: true },
  )

  watch(
    () => groupsList.value,
    (groups) => {
      if (!selectedGroupId.value && groups.length > 0) {
        selectedGroupId.value = groups[0]?.id || null
      }
    },
    { immediate: true },
  )

  watch(
    () => selectedGroupId.value,
    (groupId) => {
      if (!groupId) {
        groupToRender.value = null
        groupError.value = ''
        return
      }

      fetchGroupDetail(groupId)
    },
    { immediate: true },
  )

  // Watch for search item ID in query params
  watch(
    () => route.query.searchItemId,
    (searchItemId) => {
      if (searchItemId && typeof searchItemId === 'string') {
        setHighlightedItem(searchItemId)

        // If groupId is provided in query, select it
        const groupIdParam = route.query.groupId
        if (groupIdParam && typeof groupIdParam === 'string') {
          selectedGroupId.value = groupIdParam
        }
      } else {
        clearHighlight()
      }
    },
  )

  // Watch for groupId query param to select a group from search results
  watch(
    () => route.query.groupId,
    (groupIdParam) => {
      if (groupIdParam && typeof groupIdParam === 'string' && !route.query.searchItemId) {
        selectedGroupId.value = groupIdParam
      }
    },
  )

  return {
    boardData,
    groupsList,
    isLoading,
    isError,
    isGroupLoading,
    groupError,
    showSidebar,
    selectedGroupId,
    groupToRender,
    highlightedItemId,
    toggleSidebar,
    handleErrorAction,
    handleGroupErrorAction,
    handleSelectGroup,
    handleGroupsChange,
    clearHighlight,
    setHighlightedItem,
  }
}

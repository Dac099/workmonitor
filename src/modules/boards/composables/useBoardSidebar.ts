import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/utils/contants'
import { useColorsStore } from '@/stores/colors'
import type { Group } from '../types/groups'
import type { Board } from '../../projectsHome/types/board'

interface OverlayMenuExpose {
  toggle: (event: MouseEvent) => void
  close: () => void
}

interface UseBoardSidebarOptions {
  getGroups: () => Group[]
  onGroupsChange: (groups: Group[]) => void
}

export const useBoardSidebar = ({ getGroups, onGroupsChange }: UseBoardSidebarOptions) => {
  const route = useRoute()
  const colorsStore = useColorsStore()
  const menuRef = ref<OverlayMenuExpose | null>(null)
  const boardsMenuRef = ref<OverlayMenuExpose | null>(null)
  const isCreateGroupOpen = ref(false)
  const groupName = ref('')
  const selectedColor = ref('')
  const isSubmitting = ref(false)
  const boards = ref<Board[]>([])
  const isBoardsLoading = ref(false)

  const canSubmit = computed(() => {
    return groupName.value.trim().length > 0 && selectedColor.value.trim().length > 0
  })

  const toggleMenu = (event: MouseEvent) => {
    menuRef.value?.toggle(event)
  }

  const closeMenu = () => {
    menuRef.value?.close()
  }

  const toggleBoardsMenu = (event: MouseEvent) => {
    boardsMenuRef.value?.toggle(event)
  }

  const closeBoardsMenu = () => {
    boardsMenuRef.value?.close()
  }

  const openCreateGroup = () => {
    isCreateGroupOpen.value = true
    closeMenu()
    closeBoardsMenu()
  }

  const closeCreateGroup = () => {
    isCreateGroupOpen.value = false
  }

  const handleSubmitGroup = async () => {
    if (!canSubmit.value || isSubmitting.value) return

    const boardId = String(route.params.boardId ?? '')

    if (!boardId) return

    try {
      isSubmitting.value = true
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          name: groupName.value.trim(),
          color: selectedColor.value.trim(),
        }),
      })

      if (!response.ok) {
        return
      }

      const createdGroup: Group = await response.json()
      onGroupsChange([...getGroups(), createdGroup])
      groupName.value = ''
      selectedColor.value = ''
      closeCreateGroup()
    } finally {
      isSubmitting.value = false
    }
  }

  const fetchBoards = async () => {
    try {
      isBoardsLoading.value = true
      const response = await fetch(`${API_BASE_URL}/boards`)

      if (!response.ok) {
        return
      }

      boards.value = await response.json()
    } finally {
      isBoardsLoading.value = false
    }
  }

  onMounted(() => {
    fetchBoards()
  })

  return {
    availableColors: colorsStore.availableColors,
    menuRef,
    boardsMenuRef,
    isCreateGroupOpen,
    groupName,
    selectedColor,
    isSubmitting,
    canSubmit,
    isBoardsLoading,
    boards,
    toggleMenu,
    toggleBoardsMenu,
    closeBoardsMenu,
    openCreateGroup,
    closeCreateGroup,
    handleSubmitGroup,
  }
}

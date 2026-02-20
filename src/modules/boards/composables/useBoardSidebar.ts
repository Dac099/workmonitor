import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE_URL } from '@/utils/contants'
import { useColorsStore } from '@/stores/colors'
import type { Group } from '../types/groups'

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
  const isCreateGroupOpen = ref(false)
  const groupName = ref('')
  const selectedColor = ref('')
  const isSubmitting = ref(false)

  const canSubmit = computed(() => {
    return groupName.value.trim().length > 0 && selectedColor.value.trim().length > 0
  })

  const toggleMenu = (event: MouseEvent) => {
    menuRef.value?.toggle(event)
  }

  const closeMenu = () => {
    menuRef.value?.close()
  }

  const openCreateGroup = () => {
    isCreateGroupOpen.value = true
    closeMenu()
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

  return {
    availableColors: colorsStore.availableColors,
    menuRef,
    isCreateGroupOpen,
    groupName,
    selectedColor,
    isSubmitting,
    canSubmit,
    toggleMenu,
    openCreateGroup,
    closeCreateGroup,
    handleSubmitGroup,
  }
}

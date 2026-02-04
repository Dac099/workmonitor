import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Group } from '../types/groups'
import { API_BASE_URL } from '@/utils/contants'

interface UseGroupsListOptions {
  groups: Ref<Group[]>
  onSelect: (groupId: string) => void
  onGroupsChange: (groups: Group[]) => void
}

export const useGroupsList = ({ groups, onSelect, onGroupsChange }: UseGroupsListOptions) => {
  const openMenuId = ref<string | null>(null)
  const localGroups = ref<Group[]>([...groups.value])

  const isEditOpen = ref(false)
  const isMoveOpen = ref(false)
  const isCopyOpen = ref(false)
  const editingGroup = ref<Group | null>(null)
  const activeGroup = ref<Group | null>(null)
  const editForm = ref({ name: '', color: '#6c7ae0' })
  const boardsList = ref<Array<{ id: string; name: string }>>([])
  const targetBoardId = ref('')

  const toggleMenu = (groupId: string) => {
    openMenuId.value = openMenuId.value === groupId ? null : groupId
  }

  const closeMenu = () => {
    openMenuId.value = null
  }

  const openEdit = (group: Group) => {
    editingGroup.value = group
    editForm.value = { name: group.name, color: group.color }
    isEditOpen.value = true
    closeMenu()
  }

  const closeEdit = () => {
    isEditOpen.value = false
    editingGroup.value = null
  }

  const submitEdit = async () => {
    if (!editingGroup.value) return

    const response = await fetch(`${API_BASE_URL}/groups/${editingGroup.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.value.name,
        color: editForm.value.color,
      }),
    })

    if (!response.ok) return

    const updatedGroup: Group = {
      ...editingGroup.value,
      name: editForm.value.name,
      color: editForm.value.color,
    }

    localGroups.value = localGroups.value.map((group) =>
      group.id === updatedGroup.id ? updatedGroup : group,
    )
    onGroupsChange(localGroups.value)
    closeEdit()
  }

  const handleDelete = async (groupId: string) => {
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
    })

    if (!response.ok) return

    localGroups.value = localGroups.value.filter((group) => group.id !== groupId)
    onGroupsChange(localGroups.value)

    const nextSelected = localGroups.value[0]?.id
    if (nextSelected) {
      onSelect(nextSelected)
    }

    closeMenu()
  }

  const loadBoards = async () => {
    if (boardsList.value.length > 0) return

    const response = await fetch(`${API_BASE_URL}/boards`)
    if (!response.ok) return

    const data = await response.json()
    boardsList.value = Array.isArray(data)
      ? data.map((board: { id: string; name: string }) => ({
          id: board.id,
          name: board.name,
        }))
      : []
  }

  const openMove = async (group: Group) => {
    activeGroup.value = group
    targetBoardId.value = ''
    isMoveOpen.value = true
    closeMenu()
    await loadBoards()
  }

  const closeMove = () => {
    isMoveOpen.value = false
    activeGroup.value = null
  }

  const openCopy = async (group: Group) => {
    activeGroup.value = group
    targetBoardId.value = ''
    isCopyOpen.value = true
    closeMenu()
    await loadBoards()
  }

  const closeCopy = () => {
    isCopyOpen.value = false
    activeGroup.value = null
  }

  const submitMove = async () => {
    if (!activeGroup.value || !targetBoardId.value) return

    const response = await fetch(`${API_BASE_URL}/groups/${activeGroup.value.id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetBoardId: targetBoardId.value }),
    })

    if (!response.ok) return

    localGroups.value = localGroups.value.filter((group) => group.id !== activeGroup.value?.id)
    onGroupsChange(localGroups.value)

    const nextSelected = localGroups.value[0]?.id
    if (nextSelected) {
      onSelect(nextSelected)
    }

    closeMove()
  }

  const submitCopy = async () => {
    if (!activeGroup.value || !targetBoardId.value) return

    const response = await fetch(`${API_BASE_URL}/groups/${activeGroup.value.id}/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetBoardId: targetBoardId.value }),
    })

    if (!response.ok) return

    closeCopy()
  }

  const handleDocumentClick = () => {
    closeMenu()
  }

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick)
  })

  watch(
    () => groups.value,
    (nextGroups) => {
      localGroups.value = [...nextGroups]
    },
    { deep: true },
  )

  return {
    localGroups,
    openMenuId,
    isEditOpen,
    isMoveOpen,
    isCopyOpen,
    editForm,
    boardsList,
    targetBoardId,
    toggleMenu,
    openEdit,
    closeEdit,
    submitEdit,
    handleDelete,
    openMove,
    closeMove,
    submitMove,
    openCopy,
    closeCopy,
    submitCopy,
  }
}

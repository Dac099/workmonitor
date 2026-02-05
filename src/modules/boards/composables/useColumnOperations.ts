import type { Column } from '@/shared/types/columns'
import { useColumnsStore } from '@/stores/columns'
import { onUnmounted, ref } from 'vue'
import { API_BASE_URL } from '@/utils/contants'

type Props = {
  column: Column
}

export const useColumnOperations = ({ column }: Props) => {
  const EDGE_THRESHOLD = 50
  const SCROLL_SPEED = 10
  let scrollInterval: number | null = null
  const columnStore = useColumnsStore()
  const headerRef = ref<HTMLElement | null>(null)
  const initialCursorPos = ref(0)
  const positionReference = ref(column.columnWidth)
  const columnWidth = ref(column.columnWidth > 30 ? `${column.columnWidth}px` : '200px')
  const contentRef = ref<HTMLElement | null>(null)
  const isMenuOpen = ref(false)
  type MoveDirection = 'left' | 'right' | 'end' | 'beginning'

  // Edit sidebar state
  const isSidebarOpen = ref(false)
  const editName = ref(column.name)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const getScrollContainer = (): HTMLElement | null => {
    let element = headerRef.value?.parentElement
    while (element) {
      const overflow = getComputedStyle(element).overflowX
      if (overflow === 'auto' || overflow === 'scroll') {
        return element
      }
      element = element.parentElement
    }
    return document.documentElement
  }

  const handleAutoScroll = (clientX: number) => {
    const viewportWidth = window.innerWidth
    const scrollContainer = getScrollContainer()

    if (!scrollContainer) return

    if (scrollInterval) {
      clearInterval(scrollInterval)
      scrollInterval = null
    }

    if (clientX > viewportWidth - EDGE_THRESHOLD) {
      scrollInterval = window.setInterval(() => {
        scrollContainer.scrollLeft += SCROLL_SPEED
      }, 16)
    } else if (clientX < EDGE_THRESHOLD) {
      scrollInterval = window.setInterval(() => {
        scrollContainer.scrollLeft -= SCROLL_SPEED
      }, 16)
    }
  }

  const stopAutoScroll = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval)
      scrollInterval = null
    }
  }

  const startColumnResizer = (event: MouseEvent) => {
    initialCursorPos.value = event.clientX
    document.addEventListener('mousemove', handleCursorPosition)
    document.addEventListener('mouseup', stopColumnResizer)
  }

  const handleCursorPosition = (event: MouseEvent) => {
    const { clientX } = event
    const dragDistance = clientX - initialCursorPos.value
    const computedWidth = positionReference.value + dragDistance
    const minimalWidth = contentRef.value ? contentRef.value.clientWidth : 100

    if (computedWidth < minimalWidth) {
      columnWidth.value = `${minimalWidth}px`
    } else {
      columnWidth.value = `${computedWidth}px`
    }

    handleAutoScroll(clientX)
  }

  const stopColumnResizer = () => {
    const widthValue = columnWidth.value ? parseInt(columnWidth.value) : 200
    positionReference.value = widthValue
    document.removeEventListener('mousemove', handleCursorPosition)
    document.removeEventListener('mouseup', stopColumnResizer)
    updateColumnWidth(widthValue)
    stopAutoScroll()
  }

  const updateColumnWidth = (width: number) => {
    columnStore.updateColumn(column.id, { columnWidth: width })
    fetch(`${API_BASE_URL}/columns/${column.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ columnWidth: width }),
    }).catch((error) => {
      console.error('Error updating column width:', error)
    })
  }

  const openEditSidebar = () => {
    editName.value = column.name
    errorMessage.value = ''
    isSidebarOpen.value = true
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
    errorMessage.value = ''
  }

  const updateColumnName = async (): Promise<Column | null> => {
    if (!editName.value.trim()) {
      errorMessage.value = 'El nombre no puede estar vacío'
      return null
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const response = await fetch(`${API_BASE_URL}/columns/${column.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName.value.trim() }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar la columna')
      }

      const updatedColumn = await response.json()
      columnStore.updateColumn(column.id, { name: editName.value.trim() })
      closeSidebar()
      return updatedColumn
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Error desconocido'
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  const deleteColumn = async (): Promise<boolean> => {
    isMenuOpen.value = false
    const confirmed = window.confirm(
      `¿Está seguro que desea eliminar la columna "${column.name}"? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/columns/${column.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar la columna')
      }

      columnStore.deleteColumn(column.id)
      return true
    } catch (error) {
      console.error('Error deleting column:', error)
      alert(error instanceof Error ? error.message : 'Error al eliminar la columna')
      return false
    }
  }

  const moveColumn = async (direction: MoveDirection): Promise<boolean> => {
    isMenuOpen.value = false
    const columns = columnStore.getColumnsSorted()
    const currentPosition = column.position
    const lastPosition = columns.length - 1
    let newPosition: number

    switch (direction) {
      case 'left':
        if (currentPosition === 0) return false
        newPosition = currentPosition - 1
        break
      case 'right':
        if (currentPosition === lastPosition) return false
        newPosition = currentPosition + 1
        break
      case 'beginning':
        if (currentPosition === 0) return false
        newPosition = 0
        break
      case 'end':
        if (currentPosition === lastPosition) return false
        newPosition = lastPosition
        break
    }

    if (newPosition === currentPosition) {
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/columns/${column.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ position: newPosition }),
      })

      if (!response.ok) {
        throw new Error('Error al mover la columna')
      }

      columnStore.moveColumn(column.id, newPosition)
      return true
    } catch (error) {
      console.error('Error moving column:', error)
      alert(error instanceof Error ? error.message : 'Error al mover la columna')
      return false
    }
  }

  onUnmounted(() => {
    stopAutoScroll()
  })

  return {
    headerRef,
    columnWidth,
    startColumnResizer,
    stopColumnResizer,
    isSidebarOpen,
    editName,
    isSubmitting,
    errorMessage,
    openEditSidebar,
    closeSidebar,
    updateColumnName,
    deleteColumn,
    moveColumn,
    isMenuOpen,
  }
}

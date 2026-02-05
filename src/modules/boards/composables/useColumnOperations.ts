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

  onUnmounted(() => {
    stopAutoScroll()
  })

  return {
    headerRef,
    columnWidth,
    startColumnResizer,
    stopColumnResizer,
  }
}

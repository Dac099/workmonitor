<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { Column } from '@/shared/types/columns'
import { useColumnsStore } from '@/stores/columns'
import { API_BASE_URL } from '@/utils/contants'

const props = defineProps<{
  column: Column
}>()

const isMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const initialCursorPos = ref(0)
const positionReference = ref(props.column.columnWidth)
const columnWidth = ref(props.column.columnWidth > 30 ? `${props.column.columnWidth}px` : '200px')
const EDGE_THRESHOLD = 50
const SCROLL_SPEED = 10
let scrollInterval: number | null = null
const columnStore = useColumnsStore()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (!headerRef.value) return
  if (!headerRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

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

//Use this method to stop events listening and update store and make API call
const stopColumnResizer = () => {
  const widthValue = columnWidth.value ? parseInt(columnWidth.value) : 200
  positionReference.value = widthValue
  document.removeEventListener('mousemove', handleCursorPosition)
  document.removeEventListener('mouseup', stopColumnResizer)
  updateColumnWidth(widthValue)
  stopAutoScroll()
}

const updateColumnWidth = (width: number) => {
  columnStore.updateColumn(props.column.id, { columnWidth: width })
  fetch(`${API_BASE_URL}/columns/${props.column.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ columnWidth: width }),
  }).catch((error) => {
    console.error('Error updating column width:', error)
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  stopAutoScroll()
})
</script>

<template>
  <th ref="headerRef" :style="{ minWidth: columnWidth }">
    <section class="container" ref="contentRef" @mouseup="stopColumnResizer">
      <button type="button" class="menu-trigger" @click.stop="toggleMenu" title="Opciones">
        <i class="nf nf-md-dots_vertical"></i>
      </button>
      {{ props.column.name }}
      <span
        class="column-resizer"
        @mousedown="startColumnResizer"
        @mouseup="stopColumnResizer"
      ></span>
    </section>
    <div v-if="isMenuOpen" class="column-menu">
      <button type="button" @click="closeMenu">Editar</button>
      <button type="button" @click="closeMenu">Eliminar</button>
    </div>
  </th>
</template>

<style scoped>
th {
  font-weight: 400;
  border: 1px solid var(--ter-color);
  padding: 3px 3px;
  user-select: none;
  position: relative;
  cursor: pointer;
}

.container {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  position: relative;
}

.column-resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  opacity: 0;
}

.column-resizer:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.column-menu {
  position: absolute;
  top: 100%;
  left: 0;
  box-shadow: 3px 3px 2px 0px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ter-color);
  background-color: var(--main-color);
  display: grid;
  grid-template-columns: 120px;
  grid-auto-rows: 35px;
  border-radius: 3px;
}

.menu-trigger {
  display: inline;
  width: max-content;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.15s ease;
}

.column-menu button {
  border: none;
  background-color: var(--main-color);
  cursor: pointer;
}

.column-menu button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>

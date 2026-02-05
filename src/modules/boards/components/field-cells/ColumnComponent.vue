<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { Column } from '@/shared/types/columns'
import { useColumnOperations } from '../../composables/useColumnOperations'

const props = defineProps<{
  column: Column
}>()

const isMenuOpen = ref(false)
const { headerRef, columnWidth, startColumnResizer, stopColumnResizer } = useColumnOperations({
  column: props.column,
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (!headerRef.value) return
  if (!headerRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
      <button type="button">Editar</button>
      <button type="button">Eliminar</button>
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

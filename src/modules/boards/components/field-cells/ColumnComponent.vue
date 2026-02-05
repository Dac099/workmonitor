<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { Column } from '@/shared/types/columns'

const props = defineProps<{
  column: Column
}>()

const isMenuOpen = ref(false)
const headerRef = ref<HTMLElement | null>(null)

const columnWidth = props.column.columnWidth > 30 ? `${props.column.columnWidth}px` : '200px'

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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <th ref="headerRef" :style="{ minWidth: columnWidth }">
    <section class="container">
      <button type="button" class="menu-trigger" @click.stop="toggleMenu" title="Opciones">
        <i class="nf nf-md-dots_vertical"></i>
      </button>
      {{ props.column.name }}
      <div v-if="isMenuOpen" class="column-menu">
        <button type="button" @click="closeMenu">Editar</button>
        <button type="button" @click="closeMenu">Eliminar</button>
      </div>
    </section>
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

.column-menu {
  position: absolute;
  top: 100%;
  left: 25%;
  background: var(--main-color);
  border: 1px solid var(--ter-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 120px;
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

.column-menu button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.column-menu button:first-child {
  border-radius: 4px 4px 0 0;
}

.column-menu button:last-child {
  border-radius: 0 0 4px 4px;
}
</style>

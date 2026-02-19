<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import type { Column } from '@/shared/types/columns'
import { useColumnOperations } from '../../composables/useColumnOperations'
import SideBar from '@/shared/components/SideBar.vue'

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits<{
  (e: 'column-updated', column: Column): void
  (e: 'column-deleted', columnId: number): void
}>()

const {
  isMenuOpen,
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
} = useColumnOperations({ column: props.column })

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleOpenEditSidebar = () => {
  openEditSidebar()
  isMenuOpen.value = false
}

const handleSubmit = async () => {
  const updatedColumn = await updateColumnName()
  if (updatedColumn) {
    emit('column-updated', updatedColumn)
  }
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
    <section class="container" ref="contentRef">
      <button type="button" class="menu-trigger" @click.stop="toggleMenu" title="Opciones">
        <i class="nf nf-md-dots_vertical"></i>
      </button>
      <div @mouseup="stopColumnResizer">
        {{ props.column.name }}
        <span class="column-resizer" @mousedown="startColumnResizer"></span>
      </div>
    </section>
    <div v-if="isMenuOpen" class="column-menu">
      <button type="button" @click="handleOpenEditSidebar" class="nf nf-fa-gear"></button>
      <button type="button" @click="deleteColumn" class="nf nf-fa-trash"></button>
      <button
        type="button"
        @click="() => moveColumn('beginning')"
        class="nf nf-fa-angles_left"
      ></button>
      <button type="button" @click="() => moveColumn('left')" class="nf nf-fa-angle_left"></button>
      <button type="button" @click="() => moveColumn('end')" class="nf nf-fa-angles_right"></button>
      <button
        type="button"
        @click="() => moveColumn('right')"
        class="nf nf-fa-angle_right"
      ></button>
    </div>

    <Teleport to="body">
      <SideBar
        :is-open="isSidebarOpen"
        :initial-width="350"
        :min-width="300"
        :max-width="500"
        @close="closeSidebar"
      >
        <template #header>
          <h3 class="sidebar-title">Editar Columna</h3>
        </template>

        <form class="edit-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="column-name">Nombre de la columna</label>
            <input
              id="column-name"
              v-model="editName"
              type="text"
              placeholder="Ingrese el nombre"
              :disabled="isSubmitting"
            />
          </div>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeSidebar" :disabled="isSubmitting">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </SideBar>
    </Teleport>
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
  grid-template-columns: 80px;
  grid-auto-rows: 35px;
  border-radius: 3px;
  z-index: 2;
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
  padding: 0 5px;
}

.column-menu button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.sidebar-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--dark-color);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--ter-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--contrast-color);
}

.form-group input:disabled {
  background-color: var(--ter-color);
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid var(--ter-color);
  color: var(--dark-color);
}

.btn-cancel:hover:not(:disabled) {
  background-color: var(--ter-color);
}

.btn-submit {
  background-color: var(--contrast-color);
  border: none;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

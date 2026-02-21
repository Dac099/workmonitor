<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { ItemDetail } from '../../types/items'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import SideBar from '@/shared/components/SideBar.vue'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  item: ItemDetail
  multipleSelected: boolean
}

interface Task {
  id: string
  message: string
  completed: boolean
}

const emit = defineEmits<{
  selectionChange: [itemId: string, selected: boolean]
  move: [itemId: string]
  copy: [itemId: string]
  delete: [itemId: string]
  edit: [payload: { id: string; name: string }]
}>()

const props = defineProps<Props>()
const itemSelected = ref(false)
const contextMenuRef = ref<InstanceType<typeof OverlayMenu> | null>(null)
const showEditSidebar = ref(false)
const editItemName = ref('')
const isUpdatingItem = ref(false)

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  contextMenuRef.value?.toggle(event)
}

const handleMove = () => {
  emit('move', props.item.id)
  contextMenuRef.value?.close()
}

const handleCopy = () => {
  emit('copy', props.item.id)
  contextMenuRef.value?.close()
}

const handleDelete = () => {
  const confirmed = confirm(`¿Estás seguro de que deseas eliminar el item "${props.item.name}"?`)
  if (confirmed) {
    handleDeleteItem()
  }
  contextMenuRef.value?.close()
}

const handleDeleteItem = async () => {
  try {
    isUpdatingItem.value = true
    const response = await fetch(`${API_BASE_URL}/items/${props.item.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return
    }

    emit('delete', props.item.id)
  } finally {
    isUpdatingItem.value = false
  }
}

const handleEdit = () => {
  editItemName.value = props.item.name
  showEditSidebar.value = true
  contextMenuRef.value?.close()
}

const canSubmitEdit = () => {
  return editItemName.value.trim().length > 0 && editItemName.value !== props.item.name
}

const handleSubmitEditItem = async () => {
  if (!canSubmitEdit()) return

  try {
    isUpdatingItem.value = true
    const response = await fetch(`${API_BASE_URL}/items/${props.item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editItemName.value.trim(),
      }),
    })

    if (!response.ok) {
      return
    }

    emit('edit', { id: props.item.id, name: editItemName.value.trim() })
    showEditSidebar.value = false
    editItemName.value = ''
  } finally {
    isUpdatingItem.value = false
  }
}

const handleCloseEditSidebar = () => {
  showEditSidebar.value = false
  editItemName.value = ''
}

watch(itemSelected, (newValue) => {
  emit('selectionChange', props.item.id, newValue)
})

const taskCompletion = computed(() => {
  let totalTasks = 0
  let completedTasks = 0

  props.item.chats.forEach((chat) => {
    if (chat.tasks) {
      try {
        const tasks: Task[] = JSON.parse(chat.tasks)
        totalTasks += tasks.length
        completedTasks += tasks.filter((task) => task.completed).length
      } catch {
        // Si hay error al parsear, ignorar este chat
      }
    }
  })

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  return { percentage, totalTasks, completedTasks }
})

const dialStrokeDasharray = computed(() => {
  const circumference = 2 * Math.PI * 10 // radio = 10
  const progress = (taskCompletion.value.percentage / 100) * circumference
  return `${progress} ${circumference}`
})
</script>

<template>
  <div class="item-name-cell" @contextmenu="handleContextMenu">
    <span class="item-name">{{ props.item.name }}</span>
    <div class="item-controls">
      <div
        class="dial-container"
        :title="`${taskCompletion.completedTasks}/${taskCompletion.totalTasks} tareas completadas`"
      >
        <svg class="dial-svg" viewBox="0 0 24 24">
          <!-- Background circle -->
          <circle class="dial-bg" cx="12" cy="12" r="10" fill="none" stroke-width="2" />
          <!-- Progress circle -->
          <circle
            class="dial-progress"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke-width="2"
            :stroke-dasharray="dialStrokeDasharray"
            transform="rotate(-90 12 12)"
          />
        </svg>
        <span class="dial-text">{{ taskCompletion.percentage }}</span>
      </div>

      <button type="button" class="chat-btn" title="Chats">
        <i class="nf nf-fa-message"></i>
      </button>

      <input type="checkbox" class="checkbox-item" v-model="itemSelected" />
    </div>

    <OverlayMenu ref="contextMenuRef">
      <template #header>Opciones</template>
      <template #content>
        <section class="context-menu-options">
          <button
            type="button"
            class="context-menu-item"
            @click="handleEdit"
            v-if="!props.multipleSelected"
          >
            <i class="nf nf-md-pencil"></i>
            <span>Editar</span>
          </button>
          <button type="button" class="context-menu-item" @click="handleCopy">
            <i class="nf nf-md-content_copy"></i>
            <span>Copiar</span>
          </button>
          <button type="button" class="context-menu-item" @click="handleMove">
            <i class="nf nf-md-arrow_all"></i>
            <span>Mover</span>
          </button>
          <button
            type="button"
            class="context-menu-item context-menu-item--danger"
            @click="handleDelete"
          >
            <i class="nf nf-md-trash_can"></i>
            <span>Eliminar</span>
          </button>
        </section>
      </template>
    </OverlayMenu>

    <SideBar :is-open="showEditSidebar" :initial-width="380" @close="handleCloseEditSidebar">
      <template #header>
        <h4>Editar item</h4>
      </template>
      <form class="edit-form" @submit.prevent="handleSubmitEditItem">
        <div class="form-group">
          <label for="editName">Nombre del item</label>
          <input
            id="editName"
            v-model="editItemName"
            type="text"
            placeholder="Nombre del item"
            required
          />
        </div>
        <button type="submit" class="submit-btn" :disabled="!canSubmitEdit() || isUpdatingItem">
          {{ isUpdatingItem ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </form>
    </SideBar>
  </div>
</template>

<style scoped>
.item-name-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 8px;
  gap: 8px;
}

.item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  font-size: 0.85rem;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.chat-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.5);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chat-btn:hover {
  color: var(--contrast-color);
  transform: scale(1.1);
}

.dial-container {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dial-svg {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.dial-bg {
  stroke: rgba(0, 0, 0, 0.1);
}

.dial-progress {
  stroke: var(--contrast-color);
  transition: stroke-dasharray 0.3s ease;
}

.dial-text {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--dark-color);
  z-index: 1;
}

.checkbox-item {
  width: 16px;
}

.context-menu-options {
  display: grid;
  gap: 4px;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--dark-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-align: left;
  transition: background-color 0.2s ease;
}

.context-menu-item:hover {
  background-color: var(--ter-color);
}

.context-menu-item i {
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.context-menu-item--danger {
  color: #d7263d;
}

.context-menu-item--danger:hover {
  background-color: rgba(215, 38, 61, 0.1);
  cursor: pointer;
}

.edit-form {
  display: grid;
  gap: 16px;
}

.form-group {
  display: grid;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--dark-color);
  font-weight: 500;
}

.form-group input {
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  padding: 8px 10px;
  background-color: var(--main-color);
  color: var(--dark-color);
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--contrast-color);
}

.submit-btn {
  height: 38px;
  border: none;
  border-radius: 6px;
  background-color: var(--dark-color);
  color: var(--main-color);
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style>

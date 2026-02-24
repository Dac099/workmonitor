<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { ItemDetail } from '../../types/items'
import type { Group } from '../../types/groups'
import OverlayMenu from '@/shared/components/OverlayMenu.vue'
import SideBar from '@/shared/components/SideBar.vue'
import { API_BASE_URL } from '@/utils/contants'
import ChatSection from '@/modules/itemDetail/components/ChatSection.vue'
import ProjectSection from '@/modules/itemDetail/components/ProjectSection.vue'
import ContabilitySection from '@/modules/itemDetail/components/ContabilitySection.vue'
import EditItemForm from '@/modules/boards/components/forms/EditItemForm.vue'
import MoveItemForm from '@/modules/boards/components/forms/MoveItemForm.vue'
import CopyItemForm from '@/modules/boards/components/forms/CopyItemForm.vue'
import type { Chat } from '@/modules/itemDetail/types/chat'

interface Props {
  item: ItemDetail
  multipleSelected: boolean
  groups: Group[]
}

interface Task {
  id: string
  message: string
  completed: boolean
}

const emit = defineEmits<{
  selectionChange: [itemId: string, selected: boolean]
  move: [itemId: string, targetGroupId: string]
  copy: [itemId: string, targetGroupId: string]
  delete: [itemId: string]
  edit: [payload: { id: string; name: string }]
}>()

const props = defineProps<Props>()
const itemSelected = ref(false)
const contextMenuRef = ref<InstanceType<typeof OverlayMenu> | null>(null)
const isUpdatingItem = ref(false)
type ActiveItemForm = 'edit' | 'move' | 'copy' | null
const activeItemForm = ref<ActiveItemForm>(null)
const showItemDetailsSidebar = ref(false)
const detailViewSelected = ref<'chats' | 'project' | 'contable'>('chats')
const liveChats = ref<Chat[]>(props.item.chats)

const handleContextMenu = (event: MouseEvent) => {
  event.preventDefault()
  contextMenuRef.value?.toggle(event)
}

const handleMove = () => {
  activeItemForm.value = 'move'
  contextMenuRef.value?.close()
}

const handleCopy = () => {
  activeItemForm.value = 'copy'
  contextMenuRef.value?.close()
}

const handleDelete = () => {
  const confirmed = confirm(
    `¿Estás seguro de que deseas eliminar ${props.multipleSelected ? 'los items seleccionados' : `el item "${props.item.name}"`}?`,
  )
  if (confirmed) {
    emit('delete', props.item.id)
  }
  contextMenuRef.value?.close()
}

const handleEdit = () => {
  activeItemForm.value = 'edit'
  contextMenuRef.value?.close()
}

const closeActiveItemForm = () => {
  activeItemForm.value = null
}

const handleSubmitEditItem = async (name: string) => {
  const normalizedName = name.trim()
  if (!normalizedName || normalizedName === props.item.name) return

  try {
    isUpdatingItem.value = true
    const response = await fetch(`${API_BASE_URL}/items/${props.item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: normalizedName,
      }),
    })

    if (!response.ok) {
      return
    }

    emit('edit', { id: props.item.id, name: normalizedName })
    closeActiveItemForm()
  } finally {
    isUpdatingItem.value = false
  }
}

const handleSubmitMove = (targetGroupId: string) => {
  if (!targetGroupId) {
    return
  }

  emit('move', props.item.id, targetGroupId)
  closeActiveItemForm()
}

const handleSubmitCopy = (targetGroupId: string) => {
  if (!targetGroupId) {
    return
  }

  emit('copy', props.item.id, targetGroupId)
  closeActiveItemForm()
}

const itemFormTitle = computed(() => {
  if (activeItemForm.value === 'edit') return 'Editar item'
  if (activeItemForm.value === 'move') return 'Mover item'
  if (activeItemForm.value === 'copy') return 'Copiar item'
  return ''
})

watch(itemSelected, (newValue) => {
  emit('selectionChange', props.item.id, newValue)
})

const taskCompletion = computed(() => {
  let totalTasks = 0
  let completedTasks = 0

  liveChats.value.forEach((chat) => {
    if (chat.tasks && chat.tasks !== '{[]}') {
      try {
        const tasks: Task[] = JSON.parse(chat.tasks)
        totalTasks += tasks.length
        completedTasks += tasks.filter((task) => task.completed).length
      } catch (e) {
        console.log(e)
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

const onUpdateChat = (updatedChat: Chat) => {
  const chatIndex = liveChats.value.findIndex((chat) => chat.id === updatedChat.id)
  if (chatIndex !== -1) {
    liveChats.value[chatIndex] = updatedChat
  }
}

const onCreateChat = (newChat: Chat) => {
  liveChats.value.unshift(newChat)
}

const onDeleteChat = (chatId: string) => {
  const chatIndex = liveChats.value.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    liveChats.value.splice(chatIndex, 1)
  }
}
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

      <button type="button" class="chat-btn" title="Chats" @click="showItemDetailsSidebar = true">
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

    <SideBar :is-open="activeItemForm !== null" :initial-width="380" @close="closeActiveItemForm">
      <template #header>
        <h4>{{ itemFormTitle }}</h4>
      </template>

      <EditItemForm
        v-if="activeItemForm === 'edit'"
        :item-name="props.item.name"
        :is-submitting="isUpdatingItem"
        @submit="handleSubmitEditItem"
      />
      <MoveItemForm
        v-else-if="activeItemForm === 'move'"
        :groups="props.groups"
        @submit="handleSubmitMove"
      />
      <CopyItemForm
        v-else-if="activeItemForm === 'copy'"
        :groups="props.groups"
        @submit="handleSubmitCopy"
      />
    </SideBar>

    <SideBar
      :is-open="showItemDetailsSidebar"
      :initial-width="900"
      @close="showItemDetailsSidebar = false"
    >
      <template #header>
        <h4>{{ $props.item.name }}</h4>
      </template>

      <section class="btns-list">
        <button
          type="button"
          :class="['menu-option', { selected: detailViewSelected === 'chats' }]"
          @click="detailViewSelected = 'chats'"
        >
          <i class="nf nf-fa-message"></i>
          Chats
        </button>
        <button
          type="button"
          :class="['menu-option', { selected: detailViewSelected === 'project' }]"
          @click="detailViewSelected = 'project'"
        >
          <i class="nf nf-md-briefcase"></i>
          Proyecto
        </button>
        <button
          type="button"
          :class="['menu-option', { selected: detailViewSelected === 'contable' }]"
          @click="detailViewSelected = 'contable'"
        >
          <i class="nf nf-md-calculator"></i>
          Contable
        </button>
      </section>
      <ChatSection
        v-if="detailViewSelected === 'chats'"
        :chats="liveChats"
        :item-id="props.item.id"
        @update-chat="onUpdateChat"
        @create-chat="onCreateChat"
        @delete-chat="onDeleteChat"
      />
      <ProjectSection v-else-if="detailViewSelected === 'project'" />
      <ContabilitySection v-else-if="detailViewSelected === 'contable'" />
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

.btns-list {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--dark-color);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 6px 12px;
  border-radius: 6px;
}

.menu-option.selected {
  background-color: var(--contrast-color);
  color: var(--main-color);
}
</style>

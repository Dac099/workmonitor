<script setup lang="ts">
import type { Chat } from '../types/chat'
import { ref } from 'vue'
import getDateString from '@/utils/transformers'
import ChatEditor from './ChatEditor.vue'
import { getCheckboxItemsJson } from '@/utils/transformers'
import { API_BASE_URL } from '@/utils/contants'

type Props = { chat: Chat }
type Author = { id: string; name: string }
const props = defineProps<Props>()
const onEditMode = ref(false)
const author: Author | null = JSON.parse(props.chat.createdBy)
const createdAtDate = props.chat.createdAt ? getDateString(new Date(props.chat.createdAt)) : null
const localChat = ref(props.chat)

const emit = defineEmits<{
  updateChat: [updatedChat: Chat]
  deleteChat: [chatId: string]
}>()

const onSaveContent = async (htmlContent: string) => {
  if (htmlContent === props.chat.message) {
    onEditMode.value = false
    return
  }
  const tasks = JSON.stringify(getCheckboxItemsJson(htmlContent))

  const response = await fetch(`${API_BASE_URL}/chats/${props.chat.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: htmlContent, tasks: tasks }),
  })

  if (!response.ok) {
    console.error('Error updating chat:', response.statusText)
    return
  }

  localChat.value = { ...localChat.value, message: htmlContent, tasks: tasks }
  emit('updateChat', localChat.value)

  onEditMode.value = false
}

const handleDeleteChat = async () => {
  const canDelete = confirm('¿Estás seguro de que deseas eliminar este chat?')
  if (!canDelete) return

  const response = await fetch(`${API_BASE_URL}/chats/${props.chat.id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    console.error('Error deleting chat:', response.statusText)
    return
  }

  emit('deleteChat', props.chat.id)
}
</script>

<template>
  <article class="chat-card">
    <section class="chat-header">
      <section class="header-data">
        <p class="author">
          <i class="nf nf-fa-user"></i>
          {{ author?.name ?? 'Desconocido' }}
        </p>
        <small class="time">
          {{ createdAtDate ? createdAtDate : 'Fecha desconocida' }}
        </small>
      </section>
      <section class="header-controls">
        <button
          type="button"
          class="control-btn nf nf-fa-edit"
          @click="onEditMode = !onEditMode"
        ></button>
        <button
          type="button"
          class="control-btn nf nf-fa-trash danger"
          @click="handleDeleteChat"
        ></button>
      </section>
    </section>
    <ChatEditor
      :content="localChat.message"
      :is-edit-mode="onEditMode"
      @save-content="onSaveContent"
    />
  </article>
</template>

<style scoped>
.chat-card {
  border: 1px solid var(--ter-color);
  border-radius: 5px;
  margin: 10px 0;
}

.chat-header {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-controls {
  display: flex;
  gap: 5px;
}

.control-btn {
  background: none;
  border: none;
  color: var(--dark-color);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 5px;
  background-color: var(--main-color);
  border-radius: 5px;
  opacity: 0.5;
  transition: opacity 0.2s ease-in-out;
}

.control-btn:hover {
  opacity: 1;
}

.control-btn.danger {
  color: rgb(202, 79, 79);
}

.header-data {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
}

.author {
  font-weight: 600;
  color: var(--contrast-color);
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.time {
  color: rgba(0, 0, 0, 0.3);
}

.author::after {
  content: ' | ';
  color: var(--dark-color);
}
</style>

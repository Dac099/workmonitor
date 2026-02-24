<template>
  <div class="chat-item">
    <!-- Vista normal del chat -->
    <div v-if="!isEditingChat" class="chat-item__container">
      <div class="chat-item__header">
        <div class="chat-item__meta">
          <span class="chat-item__author">{{ chat.createdBy }}</span>
          <span class="chat-item__date">{{ formatDate(chat.createdAt) }}</span>
          <span
            v-if="chat.updatedAt && chat.updatedAt !== chat.createdAt"
            class="chat-item__updated"
          >
            (editado)
          </span>
        </div>
        <div class="chat-item__actions">
          <button class="chat-item__action-btn" @click="isEditingChat = true" title="Editar">
            ✎
          </button>
          <button
            class="chat-item__action-btn chat-item__action-btn--delete"
            @click="$emit('delete', chat.id)"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="chat-item__content" v-html="chat.htmlContent"></div>

      <button class="chat-item__reply-btn" @click="isReplyingChat = true">Responder</button>
    </div>

    <!-- Editor de edición -->
    <div v-else class="chat-item__edit-mode">
      <ChatEditor
        :initial-content="props.chat.htmlContent"
        is-editing
        :is-loading="props.isLoading"
        :error="props.error"
        @save="handleUpdateChat"
        @cancel="isEditingChat = false"
      />
    </div>

    <!-- Editor de respuesta -->
    <div v-if="isReplyingChat" class="chat-item__reply-editor">
      <h4 class="chat-item__reply-title">Responder a {{ props.chat.createdBy }}</h4>
      <ChatReplyForm
        :chat-id="props.chat.id"
        :is-loading="props.isLoading"
        :error="props.error"
        @reply-created="handleReplyCreated"
        @cancel="isReplyingChat = false"
      />
    </div>

    <!-- Lista de replies -->
    <div v-if="chat.replies && chat.replies.length > 0" class="chat-item__replies">
      <ChatReply
        v-for="reply in chat.replies"
        :key="reply.id"
        :reply="reply"
        :chat-id="chat.id"
        :is-loading="isLoading"
        @delete="$emit('reply-delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Chat } from '../types/chats'
import { useChatAPI } from '../composables/useChatAPI'
import { extractTasksFromHTML, tasksToJSON } from '../utils/chatTaskParser'
import ChatEditor from './ChatEditor.vue'
import ChatReplyForm from './ChatReplyForm.vue'
import ChatReply from './ChatReply.vue'

interface Props {
  chat: Chat
  isLoading?: boolean
  error?: string | null
}

interface Emits {
  (e: 'edit', chat: Chat): void
  (e: 'delete', chatId: string): void
  (e: 'reply', chatId: string): void
  (e: 'reply-delete', replyId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { updateChat } = useChatAPI()
const isEditingChat = ref(false)
const isReplyingChat = ref(false)

const formatDate = (dateString: string): string => {
  if (!dateString) return 'Fecha desconocida'

  try {
    const date = new Date(dateString)

    // Validar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }

    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Error en fecha'
  }
}

const handleUpdateChat = async (htmlContent: string) => {
  // Extraer tareas del HTML actualizado
  const tasks = extractTasksFromHTML(htmlContent)
  const tasksJSON = tasks.length > 0 ? tasksToJSON(tasks) : null

  const success = await updateChat(props.chat.id, {
    message: htmlContent,
    tasks: tasksJSON,
  })

  if (success) {
    isEditingChat.value = false
    emit('edit', { ...props.chat, htmlContent })
  }
}

const handleReplyCreated = () => {
  isReplyingChat.value = false
  // Parent component should refetch chats if needed
}
</script>

<style scoped lang="css">
.chat-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.chat-item:hover {
  background-color: #f5f5f5;
}

.chat-item__container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.chat-item__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.chat-item__author {
  font-weight: 600;
  color: #333;
}

.chat-item__date {
  color: #999;
}

.chat-item__updated {
  color: #999;
  font-style: italic;
}

.chat-item__actions {
  display: flex;
  gap: 4px;
}

.chat-item__action-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;
}

.chat-item__action-btn:hover {
  background-color: #f0f0f0;
  border-color: #999;
  color: #333;
}

.chat-item__action-btn--delete:hover {
  background-color: #fee;
  border-color: #f99;
  color: #c00;
}

.chat-item__content {
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Estilos para contenido HTML del editor */
:deep(.chat-item__content p) {
  margin: 6px 0;
}

:deep(.chat-item__content h1),
:deep(.chat-item__content h2),
:deep(.chat-item__content h3) {
  margin: 8px 0 4px 0;
  font-weight: bold;
}

:deep(.chat-item__content h1) {
  font-size: 18px;
}

:deep(.chat-item__content h2) {
  font-size: 16px;
}

:deep(.chat-item__content h3) {
  font-size: 14px;
}

:deep(.chat-item__content ul),
:deep(.chat-item__content ol) {
  margin: 6px 0;
  padding-left: 20px;
}

:deep(.chat-item__content li) {
  margin: 2px 0;
}

:deep(.chat-item__content strong) {
  font-weight: bold;
}

:deep(.chat-item__content em) {
  font-style: italic;
}

:deep(.chat-item__content s) {
  text-decoration: line-through;
}

/* Task List Styles in Chat Content */
:deep(.chat-item__content ul[data-type='taskList']) {
  list-style: none;
  padding-left: 0;
  margin: 6px 0;
}

:deep(.chat-item__content ul[data-type='taskList'] li) {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 6px 0;
  list-style: none;
}

:deep(.chat-item__content ul[data-type='taskList'] li > label) {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  flex-shrink: 0;
  padding-top: 2px;
}

:deep(.chat-item__content ul[data-type='taskList'] li > label > input[type='checkbox']) {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  accent-color: #2563eb;
}

:deep(.chat-item__content ul[data-type='taskList'] li > label > span) {
  display: none;
}

:deep(.chat-item__content ul[data-type='taskList'] li > div) {
  flex: 1;
  padding-top: 0;
}

:deep(.chat-item__content ul[data-type='taskList'] li > div p) {
  margin: 0;
  display: inline;
}

:deep(.chat-item__content ul[data-type='taskList'] li[data-checked='true'] > div) {
  text-decoration: line-through;
  opacity: 0.6;
}

:deep(
  .chat-item__content
    ul[data-type='taskList']
    li[data-checked='true']
    > label
    > input[type='checkbox']
) {
  accent-color: #10b981;
}

.chat-item__reply-btn {
  align-self: flex-start;
  padding: 4px 12px;
  background-color: #e0e7ff;
  color: #2563eb;
  border: 1px solid #c7d2fe;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-item__reply-btn:hover {
  background-color: #c7d2fe;
  border-color: #a5b4fc;
}

.chat-item__edit-mode {
  padding: 12px 0;
  border-top: 1px solid #d0d0d0;
  border-bottom: 1px solid #d0d0d0;
}

.chat-item__reply-editor {
  padding: 12px;
  background-color: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
}

.chat-item__reply-title {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.chat-item__replies {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0 0 12px;
  border-left: 2px solid #d0d0d0;
  margin-left: 8px;
}
</style>

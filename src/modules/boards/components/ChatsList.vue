<template>
  <div class="chats-list">
    <div class="chats-list__header">
      <h3 class="chats-list__title">Chats</h3>
      <button class="chats-list__btn-new" @click="isCreatingNewChat = true">+ Nuevo Chat</button>
    </div>

    <!-- Editor para nuevo chat -->
    <div v-if="isCreatingNewChat" class="chats-list__new-chat">
      <ChatEditor
        :is-loading="isCreatingNewChat && isLoading"
        :error="error"
        @save="handleCreateChat"
        @cancel="handleCancelNewChat"
      />
    </div>

    <!-- Lista de chats -->
    <div v-if="chats.length === 0 && !isCreatingNewChat" class="chats-list__empty">
      No hay chats aún. ¡Crea uno nuevo!
    </div>

    <div v-else class="chats-list__items">
      <ChatDetail
        v-for="chat in chats"
        :key="chat.id"
        :chat="chat"
        :is-loading="isLoading"
        @edit="handleEditChat"
        @delete="handleDeleteChat"
        @reply="handleReplyChat"
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
import ChatDetail from './ChatDetail.vue'

interface Props {
  itemId: string
  chats: Chat[]
}

interface Emits {
  (e: 'chat-created', chat: Chat): void
  (e: 'chat-updated', chat: Chat): void
  (e: 'chat-deleted', chatId: string): void
  (e: 'reply-created', chatId: string, reply: any): void
  (e: 'reply-deleted', chatId: string, replyId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { isLoading, error, createChat, deleteChat } = useChatAPI()

const isCreatingNewChat = ref(false)
const editingChatId = ref<string | null>(null)

const handleCreateChat = async (htmlContent: string) => {
  if (!htmlContent.trim() || htmlContent === '<p></p>') {
    return
  }

  // Extraer tareas del HTML
  const tasks = extractTasksFromHTML(htmlContent)
  const tasksJSON = tasks.length > 0 ? tasksToJSON(tasks) : null

  const newChat = await createChat({
    itemId: props.itemId,
    message: htmlContent,
    responses: null,
    tasks: tasksJSON,
  })

  if (newChat) {
    emit('chat-created', newChat)
    isCreatingNewChat.value = false
  }
}

const handleCancelNewChat = () => {
  isCreatingNewChat.value = false
}

const handleEditChat = (chat: Chat) => {
  editingChatId.value = chat.id
}

const handleDeleteChat = async (chatId: string) => {
  const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este chat?')
  if (!confirmed) return

  const success = await deleteChat(chatId)
  if (success) {
    emit('chat-deleted', chatId)
  }
}

const handleReplyChat = (chatId: string) => {
  // This will be handled by ChatDetail component
}
</script>

<style scoped lang="css">
.chats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.chats-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.chats-list__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chats-list__btn-new {
  padding: 6px 12px;
  background-color: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.chats-list__btn-new:hover {
  background-color: #1d4ed8;
}

.chats-list__new-chat {
  padding: 0 0 16px 0;
  border-bottom: 2px solid #2563eb;
}

.chats-list__empty {
  padding: 24px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.chats-list__items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

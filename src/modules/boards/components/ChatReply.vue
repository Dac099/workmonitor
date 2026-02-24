<template>
  <div class="chat-reply">
    <div class="chat-reply__header">
      <div class="chat-reply__meta">
        <span class="chat-reply__author">{{ reply.createdBy }}</span>
        <span class="chat-reply__date">{{ formatDate(reply.createdAt) }}</span>
      </div>
      <button
        class="chat-reply__delete-btn"
        @click="$emit('delete', reply.id)"
        title="Eliminar respuesta"
      >
        ✕
      </button>
    </div>

    <div class="chat-reply__content" v-html="reply.htmlContent"></div>
  </div>
</template>

<script setup lang="ts">
import type { ChatReply } from '../types/chats'

interface Props {
  reply: ChatReply
  chatId: string
  isLoading?: boolean
}

interface Emits {
  (e: 'delete', replyId: string): void
}

defineProps<Props>()
defineEmits<Emits>()

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}
</script>

<style scoped lang="css">
.chat-reply {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 12px;
}

.chat-reply__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
}

.chat-reply__meta {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #666;
}

.chat-reply__author {
  font-weight: 600;
  color: #333;
  font-size: 12px;
}

.chat-reply__date {
  color: #999;
  font-size: 11px;
}

.chat-reply__delete-btn {
  padding: 2px 6px;
  background-color: transparent;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  cursor: pointer;
  font-size: 11px;
  color: #999;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chat-reply__delete-btn:hover {
  background-color: #fee;
  border-color: #f99;
  color: #c00;
}

.chat-reply__content {
  padding: 4px 0;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Estilos para contenido HTML */
:deep(.chat-reply__content p) {
  margin: 4px 0;
}

:deep(.chat-reply__content strong) {
  font-weight: bold;
}

:deep(.chat-reply__content em) {
  font-style: italic;
}

:deep(.chat-reply__content s) {
  text-decoration: line-through;
}
</style>

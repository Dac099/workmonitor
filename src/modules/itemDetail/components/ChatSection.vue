<script lang="ts" setup>
import type { Chat } from '../types/chat'
import { API_BASE_URL } from '@/utils/contants'
import { ref } from 'vue'
import ChatCard from './ChatCard.vue'
import ChatEditor from './ChatEditor.vue'
import { getCheckboxItemsJson } from '@/utils/transformers'

type Props = {
  chats: Chat[]
  itemId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateChat: [updatedChat: Chat]
  createChat: [newChat: Chat]
  deleteChat: [chatId: string]
}>()
const liveChats = ref<Chat[]>(props.chats)
const openEditor = ref(false)

const onUpdateChat = (updatedChat: Chat) => {
  const chatIndex = liveChats.value.findIndex((chat) => chat.id === updatedChat.id)
  if (chatIndex !== -1) {
    liveChats.value[chatIndex] = updatedChat
    emit('updateChat', updatedChat)
  }
}

const onCreateChat = async (htmlContent: string) => {
  openEditor.value = false
  const tasks = getCheckboxItemsJson(htmlContent)

  const response = await fetch(`${API_BASE_URL}/chats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      itemId: props.itemId,
      message: htmlContent,
      tasks: JSON.stringify(tasks),
    }),
  })

  if (!response.ok) {
    console.error('Error creating chat:', response.statusText)
    return
  }

  const chatCreated = (await response.json()) as Chat

  emit('createChat', chatCreated)
}

const onDeleteChat = (chatId: string) => {
  const chatIndex = liveChats.value.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    liveChats.value.splice(chatIndex, 1)
    emit('deleteChat', chatId)
  }
}
</script>

<template>
  <section class="section-controls">
    <button
      type="button"
      class="control nf nf-md-message_plus"
      @click="openEditor = !openEditor"
    ></button>
  </section>

  <section v-if="openEditor">
    <ChatEditor @save-content="onCreateChat" content="" :is-edit-mode="true" />
  </section>

  <section class="chat-lists">
    <ChatCard
      v-for="chat in liveChats"
      :key="chat.id"
      :chat="chat"
      @update-chat="onUpdateChat"
      @delete-chat="onDeleteChat"
    />
  </section>
</template>

<style scoped>
.section-controls {
  display: flex;
  justify-content: flex-end;
  margin: 12px 0;
}

.control {
  background-color: var(--dark-color);
  color: var(--main-color);
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>

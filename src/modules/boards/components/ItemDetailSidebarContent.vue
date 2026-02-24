<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { ItemDetailDto } from '../types/items'
import type { Chat } from '../types/chats'
import ChatsList from './ChatsList.vue'

interface Props {
  itemDetail: ItemDetailDto | null
  isLoading: boolean
  errorMessage: string
  activeTab: 'chats' | 'subitems' | 'project'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:activeTab', value: Props['activeTab']): void
}>()

const chats = ref<Chat[]>([])

/**
 * Valida si una fecha es un ISO 8601 válido
 */
const isValidISODate = (dateString: string | null): boolean => {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Valida si un string es JSON válido
 */
const isJsonString = (str: string | null): boolean => {
  if (!str) return false
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Transforma y valida chats del backend para asegurar estructura correcta
 * Maneja tanto la estructura antigua como la nueva
 */
const transformChats = (backendChats: any[]): Chat[] => {
  if (!Array.isArray(backendChats)) return []

  return backendChats.map((chatDto: any): Chat => {
    // Determinar htmlContent: usar la nueva estructura 'htmlContent' o la antigua 'message'
    let htmlContent = chatDto.htmlContent || chatDto.message || ''

    // Si htmlContent es JSON (error del backend), extraer nombre y convertir a HTML
    if (isJsonString(htmlContent)) {
      try {
        const parsed = JSON.parse(htmlContent)
        const name = parsed?.name || parsed?.message || 'Sin contenido'
        htmlContent = `<p>${escapeHtml(name)}</p>`
      } catch {
        htmlContent = '<p>Error al procesar contenido</p>'
      }
    }

    // Asegurar que htmlContent no esté vacío
    if (!htmlContent || htmlContent.trim() === '') {
      htmlContent = '<p>Sin contenido</p>'
    }

    // Parsear createdBy: si es JSON string, extraer el nombre
    let createdBy = chatDto.createdBy || 'Usuario desconocido'
    if (isJsonString(createdBy)) {
      try {
        const createdByObj = JSON.parse(createdBy)
        createdBy = createdByObj?.name || createdByObj?.id || 'Usuario desconocido'
      } catch {
        // Si no se puede parsear, mantener como está
      }
    }

    // Validar y asegurar fecha correcta
    let createdAt = isValidISODate(chatDto.createdAt) ? chatDto.createdAt : new Date().toISOString()

    // Parsear replies desde responses si es necesario (estructura antigua)
    let replies: any[] = []
    if (chatDto.replies && Array.isArray(chatDto.replies)) {
      replies = chatDto.replies
    } else if (chatDto.responses && isJsonString(chatDto.responses)) {
      try {
        replies = JSON.parse(chatDto.responses)
      } catch {
        replies = []
      }
    }

    return {
      id: chatDto.id || '',
      itemId: chatDto.itemId || '',
      htmlContent,
      createdBy,
      createdAt,
      updatedAt: isValidISODate(chatDto.updatedAt) ? chatDto.updatedAt : null,
      replies,
      tasks: chatDto.tasks || null, // Preservar tasks del backend
    }
  })
}

/**
 * Escapa caracteres HTML para evitar inyección
 */
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

// Sincronizar chats cuando el itemDetail cambia
watch(
  () => props.itemDetail,
  (newItemDetail) => {
    if (newItemDetail && newItemDetail.chats) {
      chats.value = transformChats(newItemDetail.chats)
    } else {
      chats.value = []
    }
  },
  { immediate: true },
)

const setTab = (value: Props['activeTab']) => {
  emit('update:activeTab', value)
}

const handleChatCreated = (chat: Chat) => {
  chats.value.push(chat)
}

const handleChatUpdated = (updatedChat: Chat) => {
  const index = chats.value.findIndex((c) => c.id === updatedChat.id)
  if (index !== -1) {
    chats.value[index] = updatedChat
  }
}

const handleChatDeleted = (chatId: string) => {
  chats.value = chats.value.filter((c) => c.id !== chatId)
}

const handleReplyCreated = (chatId: string) => {
  // Replies are managed within ChatDetail component
}

const handleReplyDeleted = (chatId: string, replyId: string) => {
  const chat = chats.value.find((c) => c.id === chatId)
  if (chat && chat.replies) {
    chat.replies = chat.replies.filter((r) => r.id !== replyId)
  }
}
</script>

<template>
  <div class="item-detail">
    <div class="item-detail__tabs">
      <button
        type="button"
        class="item-detail__tab"
        :class="{ 'item-detail__tab--active': props.activeTab === 'chats' }"
        @click="setTab('chats')"
      >
        Chats
      </button>
      <button
        type="button"
        class="item-detail__tab"
        :class="{ 'item-detail__tab--active': props.activeTab === 'subitems' }"
        @click="setTab('subitems')"
      >
        Subitems
      </button>
      <button
        type="button"
        class="item-detail__tab"
        :class="{ 'item-detail__tab--active': props.activeTab === 'project' }"
        @click="setTab('project')"
      >
        Proyecto
      </button>
    </div>

    <div class="item-detail__content">
      <p v-if="props.isLoading" class="item-detail__status">Cargando...</p>
      <p v-else-if="props.errorMessage" class="item-detail__status item-detail__status--error">
        {{ props.errorMessage }}
      </p>

      <div v-else-if="props.itemDetail" class="item-detail__panel">
        <div v-if="props.activeTab === 'chats'" class="item-detail__section">
          <ChatsList
            v-if="props.itemDetail"
            :item-id="props.itemDetail.id"
            :chats="chats"
            @chat-created="handleChatCreated"
            @chat-updated="handleChatUpdated"
            @chat-deleted="handleChatDeleted"
            @reply-created="handleReplyCreated"
            @reply-deleted="handleReplyDeleted"
          />
        </div>

        <div v-else-if="props.activeTab === 'subitems'" class="item-detail__section">
          <div v-if="props.itemDetail.subItems.length === 0" class="item-detail__empty">
            Sin subitems.
          </div>
          <ul v-else class="item-detail__list">
            <li
              v-for="subItem in props.itemDetail.subItems"
              :key="subItem.id"
              class="item-detail__row"
            >
              {{ subItem.name }}
            </li>
          </ul>
        </div>

        <div v-else class="item-detail__section">
          <div v-if="!props.itemDetail.project" class="item-detail__empty">
            Sin proyecto asociado.
          </div>
          <div v-else class="item-detail__grid">
            <div class="item-detail__field">
              <span class="item-detail__label">ID</span>
              <span class="item-detail__value">{{ props.itemDetail.project.projectId }}</span>
            </div>
            <div class="item-detail__field">
              <span class="item-detail__label">Nombre</span>
              <span class="item-detail__value">
                {{ props.itemDetail.project.projectName || 'Sin nombre' }}
              </span>
            </div>
            <div class="item-detail__field">
              <span class="item-detail__label">Descripcion</span>
              <span class="item-detail__value">
                {{ props.itemDetail.project.projectDescription || 'Sin descripcion' }}
              </span>
            </div>
            <div class="item-detail__field">
              <span class="item-detail__label">Fechas</span>
              <span class="item-detail__value">
                {{ props.itemDetail.project.startDate || 'N/A' }} -
                {{ props.itemDetail.project.endDate || 'N/A' }}
              </span>
            </div>
            <div class="item-detail__field">
              <span class="item-detail__label">Cliente</span>
              <span class="item-detail__value">
                {{ props.itemDetail.project.clientName || 'Sin cliente' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-detail__tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.item-detail__tab {
  border: 1px solid var(--ter-color);
  background: var(--main-color);
  color: var(--dark-color);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  cursor: pointer;
}

.item-detail__tab--active {
  border-color: var(--contrast-color);
  color: var(--contrast-color);
}

.item-detail__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-detail__status {
  font-size: 0.85rem;
  color: var(--dark-color);
}

.item-detail__status--error {
  color: #d7263d;
}

.item-detail__panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-detail__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-detail__empty {
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
}

.item-detail__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.item-detail__card {
  border: 1px solid var(--ter-color);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--main-color);
}

.item-detail__text {
  margin: 0 0 6px;
  font-size: 0.9rem;
  color: var(--dark-color);
}

.item-detail__meta {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.55);
}

.item-detail__row {
  border: 1px solid var(--ter-color);
  border-radius: 8px;
  padding: 8px 12px;
  background: var(--main-color);
  font-size: 0.85rem;
  color: var(--dark-color);
}

.item-detail__grid {
  display: grid;
  gap: 10px;
}

.item-detail__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-detail__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(0, 0, 0, 0.55);
}

.item-detail__value {
  font-size: 0.9rem;
  color: var(--dark-color);
}
</style>

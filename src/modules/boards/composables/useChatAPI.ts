import { ref } from 'vue'
import type {
  Chat,
  ChatReply,
  CreateChatRequest,
  UpdateChatRequest,
  CreateReplyRequest,
} from '../types/chats'

const API_BASE_URL = 'http://localhost:5267/api'

/**
 * Composable para manejar operaciones CRUD de chats
 * Incluye funciones para crear, actualizar, eliminar chats y sus replies
 */
export function useChatAPI() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Crear un nuevo chat
   */
  const createChat = async (request: CreateChatRequest): Promise<Chat | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Failed to create chat: ${response.statusText}`)
      }

      const createdChat: Chat = await response.json()
      return createdChat
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear chat'
      error.value = errorMessage
      console.error('Error creating chat:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Actualizar un chat existente
   */
  const updateChat = async (chatId: string, request: UpdateChatRequest): Promise<Chat | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`Failed to update chat: ${response.statusText}`)
      }

      const updatedChat: Chat = await response.json()
      return updatedChat
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al actualizar chat'
      error.value = errorMessage
      console.error('Error updating chat:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar un chat
   */
  const deleteChat = async (chatId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete chat: ${response.statusText}`)
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar chat'
      error.value = errorMessage
      console.error('Error deleting chat:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crear una respuesta (reply) a un chat
   */
  const createReply = async (request: CreateReplyRequest): Promise<ChatReply | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${request.chatId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: request.htmlContent }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create reply: ${response.statusText}`)
      }

      const createdReply: ChatReply = await response.json()
      return createdReply
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al crear respuesta'
      error.value = errorMessage
      console.error('Error creating reply:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Eliminar una respuesta (reply)
   */
  const deleteReply = async (chatId: string, replyId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/replies/${replyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete reply: ${response.statusText}`)
      }

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido al eliminar respuesta'
      error.value = errorMessage
      console.error('Error deleting reply:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    createChat,
    updateChat,
    deleteChat,
    createReply,
    deleteReply,
  }
}

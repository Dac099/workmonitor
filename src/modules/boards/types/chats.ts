/**
 * Chat Reply - Respuesta anidada a un chat
 */
export type ChatReply = {
  id: string
  chatId: string
  htmlContent: string
  createdBy: string
  createdAt: string
  updatedAt: string | null
}

/**
 * Chat - Mensaje en un item con replies anidadas
 */
export type Chat = {
  id: string
  itemId: string
  htmlContent: string
  createdBy: string
  createdAt: string
  updatedAt: string | null
  replies: ChatReply[]
  tasks?: string | null // JSON string de Task[]
}

/**
 * DTO para Chat (valores opcionales del backend)
 */
export type ChatDto = {
  id: string
  itemId: string | null
  htmlContent: string | null
  createdBy: string | null
  createdAt: string | null
  updatedAt: string | null
  replies: ChatReplyDto[] | null
}

/**
 * DTO para ChatReply
 */
export type ChatReplyDto = {
  id: string
  chatId: string
  htmlContent: string | null
  createdBy: string | null
  createdAt: string | null
  updatedAt: string | null
}

/**
 * Request para crear un nuevo chat
 */
export type CreateChatRequest = {
  itemId: string
  message: string
  responses?: string | null
  tasks?: string | null
}

/**
 * Request para actualizar un chat existente
 */
export type UpdateChatRequest = {
  message: string
  tasks?: string | null
}

/**
 * Request para crear una respuesta a un chat
 */
export type CreateReplyRequest = {
  chatId: string
  htmlContent: string
}

/**
 * Tarea extraída del HTML del chat
 */
export type Task = {
  id: string
  message: string
  completed: boolean
}

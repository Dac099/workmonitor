export type Chat = {
  id: string
  itemId: string
  message: string
  createdBy: string
  createdAt?: string
  responses?: string | null
  tasks?: string | null
}

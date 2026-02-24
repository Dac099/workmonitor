import type { Chat, ChatDto } from './chats'
import type { Value } from './values'

export type Item = {
  id: string
  projectId: string
  name: string
  position: number
}

export type SubItem = {
  id: string
  itemId: string
  name: string
}

export type ItemDetail = {
  id: string
  groupId: string
  name: string
  position: number
  projectId: string | null
  values: Array<Value>
  chats: Array<Chat>
}

export type ProjectDetailDto = {
  projectId: string
  projectName: string | null
  projectDescription: string | null
  startDate: string | null
  endDate: string | null
  clientId: number | null
  clientName: string | null
}

export type SubItemDto = {
  id: string
  name: string
  itemParent: string
}

export type ItemDetailDto = {
  id: string
  groupId: string
  name: string
  position: number
  projectId: string | null
  project: ProjectDetailDto | null
  subItems: Array<SubItemDto>
  chats: Array<ChatDto>
}

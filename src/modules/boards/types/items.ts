import type { Chat } from './chats'
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

export type SubItemTableValue = {
  id: string
  itemId: string | null
  columnId: string
  value: string | null
  columnType: string
}

export type SubItemDetail = {
  id: string
  itemParent: string
  name: string
  values: Array<SubItemTableValue>
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

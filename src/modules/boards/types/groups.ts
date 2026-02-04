import type { ItemDetail } from './items'

export type Group = {
  id: string
  name: string
  color: string
  position: number
  boardId: string
}

export type NewGroup = {
  name: string
  color: string
}

export type GroupDetail = {
  id: string
  name: string
  color: string
  boardId: string
  position: number
  items: Array<ItemDetail>
}

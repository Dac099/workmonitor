import type { Ref } from 'vue'
import type { GroupDetail } from './groups'
import type { SubItemDetail } from './items'
import type { Value } from './values'

export interface MoveItemsPayload {
  itemIds: string[]
  targetGroupId: string
}

export interface CopyItemPayload {
  itemIds: string[]
  targetGroupId: string
}

export interface DeleteItemsPayload {
  itemIds: string[]
}

export interface CreateSubitemPayload {
  name: string
  itemParent: string
}

export interface CreateSubitemValueResponse {
  id: string
  itemId: string | null
  columnId: string
  value: string | null
  columnType: string
}

export interface CreateSubitemResponse {
  id: string
  itemParent: string
  name: string
  values?: CreateSubitemValueResponse[]
}

export interface ItemWithValues {
  values: Array<Value>
}

export interface SubItemRow {
  id: string
  itemParent: string
  name: string
  values: Array<Value>
}

export type GetSubItemsResponse = Array<SubItemDetail>

export type GroupItemsRef = Ref<GroupDetail['items']>

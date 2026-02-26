export type UUID = string

export interface SearcherQueryParams {
  query?: string
}

export interface SearchWorkspaceResult {
  id: UUID
  name: string
}

export interface SearchBoardResult {
  id: UUID
  workspaceId: UUID
  name: string
}

export interface SearchGroupResult {
  id: UUID
  boardId: UUID
  name: string
}

export interface SearchItemResult {
  id: UUID
  groupId: UUID
  name: string
}

export interface SearcherResponse {
  workspaces: SearchWorkspaceResult[]
  boards: SearchBoardResult[]
  groups: SearchGroupResult[]
  items: SearchItemResult[]
}

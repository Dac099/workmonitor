export type Board = {
  id: number
  workspaceId: string
  workspaceName: string
  name: string
  description: string | null
}

export type SubmitBoardDto = {
  name: string
  workspaceId: string
  description: string | null
}

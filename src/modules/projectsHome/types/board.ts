export type Board = {
  id: string
  workspaceId: string
  workspaceName: string
  name: string
  description: string | null
  hasTimeline?: boolean
}

export type SubmitBoardDto = {
  name: string
  workspaceId: string
  description: string | null
}

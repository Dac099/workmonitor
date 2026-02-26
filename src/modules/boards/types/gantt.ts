export type GanttGroup = {
  id: string
  boardId: string
  name: string
  position: number
  color: string | null
}

export type GanttItem = {
  id: string
  groupId: string
  name: string
  position: number
  timelineValueId: string | null
  timelineValue: string | null
}

export type GanttBoardData = {
  boardId: string
  timelineColumnId: string | null
  timelineColumnName: string | null
  groups: GanttGroup[]
  items: GanttItem[]
}

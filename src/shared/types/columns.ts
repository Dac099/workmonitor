export type ColumnType = 'text' | 'number' | 'date' | 'status' | 'timeline'

export type Column = {
  id: string
  boardId: string
  name: string
  type: ColumnType
  settings: string | null
  position: number
  columnWidth: number
}

export type NewColumn = {
  id: string
  boardId: string
  name: string
  type: ColumnType
  settings: string | null
  position: number
}

export type ColumnType = 'text' | 'number' | 'date' | 'status' | 'timeline'

export type Column = {
  id: number
  name: string
  type: ColumnType
  settings: string
  width: number
  position: number
}

export type NewColumn = {
  name: string
  type: ColumnType
  settings?: string
  width?: number
}

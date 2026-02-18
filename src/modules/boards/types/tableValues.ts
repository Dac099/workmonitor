export type TableValue = {
  id: string
  itemId: string
  columnId: string
  value: string
}

export type TableValuesByColumn = {
  columnId: string
  columnName: string
  values: TableValue[]
}

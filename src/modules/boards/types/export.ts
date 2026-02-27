export type ExportOptions = {
  groupIds: string[]
  columnIds: string[]
  includeGantt: boolean
}

export type ExportState = {
  isExporting: boolean
  error: string | null
}

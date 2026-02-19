import type { Column } from '@/shared/types/columns'

export type ColumnCreated = {
  column: Column
  definedValues: {
    id: number
    name: string
    value: string
  }[]
}

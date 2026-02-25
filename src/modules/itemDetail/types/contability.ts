export interface ContabilityBoardDto {
  id: string
  name: string
  workspaceId: string
  description: string | null
}

export interface ContabilityProjectDto {
  idProyect: string
  nomProyecto: string | null
  nomCliente: string | null
  idCliente: number | null
}

export interface ContabilityGroupDto {
  id: string
  boardId: string
  name: string
  position: number
  color: string | null
}

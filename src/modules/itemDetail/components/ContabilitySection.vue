<script lang="ts" setup>
import { ref, watch } from 'vue'
import BoardGroupDetail from '@/modules/boards/components/BoardGroupDetail.vue'
import type { GroupDetail } from '@/modules/boards/types/groups'
import type { Column } from '@/shared/types/columns'
import LoaderComponent from '@/core/components/LoaderComponent.vue'
import { useContabilityColumnsStore } from '@/stores/contabilityColumns'
import { useColorsStore } from '@/stores/colors'
import { API_BASE_URL } from '@/utils/contants'
import type {
  ContabilityBoardDto,
  ContabilityGroupDto,
  ContabilityProjectDto,
} from '@/modules/itemDetail/types/contability'

interface CreateContabilityGroupPayload {
  boardId: string
  name: string
  color: string
}

const props = defineProps<{
  itemId: string
  projectId: string | null
}>()

const contabilityColumnsStore = useContabilityColumnsStore()
const colorsStore = useColorsStore()

const isLoading = ref(false)
const isCreatingGroup = ref(false)
const requestError = ref('')
const requestErrorDetail = ref('')
const groupDetail = ref<GroupDetail | null>(null)
const inconsistentGroups = ref<ContabilityGroupDto[]>([])
const emptyStateMessage = ref('')
const cobranzaBoardId = ref('')
const composedGroupName = ref('')
const showCreateGroupForm = ref(false)
const selectedGroupColor = ref(colorsStore.availableColors[0] ?? '#266DD3')
let activeRequestId = 0

const resetState = () => {
  requestError.value = ''
  requestErrorDetail.value = ''
  groupDetail.value = null
  inconsistentGroups.value = []
  emptyStateMessage.value = ''
  cobranzaBoardId.value = ''
  composedGroupName.value = ''
  showCreateGroupForm.value = false
}

const loadBoardGroupDetail = async (boardId: string, groupId: string) => {
  const [columnsResponse, groupDetailResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/columns/board/${encodeURIComponent(boardId)}`),
    fetch(`${API_BASE_URL}/groups/${encodeURIComponent(groupId)}`),
  ])

  if (!columnsResponse.ok || !groupDetailResponse.ok) {
    requestError.value = 'Error al obtener el detalle contable del proyecto'
    requestErrorDetail.value =
      'No fue posible consultar las columnas o el detalle del grupo contable.'
    return
  }

  const columns = (await columnsResponse.json()) as Column[]
  const group = (await groupDetailResponse.json()) as GroupDetail

  contabilityColumnsStore.setColumns(columns)
  groupDetail.value = group
}

const loadContabilityGroup = async (projectId: string | null) => {
  const requestId = ++activeRequestId
  resetState()

  if (!projectId) {
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    const [boardResponse, projectResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/boards/cobranza`),
      fetch(`${API_BASE_URL}/proyects/${encodeURIComponent(projectId)}`),
    ])

    if (!boardResponse.ok || !projectResponse.ok) {
      requestError.value = 'Error al obtener el detalle contable del proyecto'
      requestErrorDetail.value = 'No fue posible consultar el tablero de cobranza o el proyecto.'
      return
    }

    const board = (await boardResponse.json()) as ContabilityBoardDto
    const project = (await projectResponse.json()) as ContabilityProjectDto | null
    const projectName = (project?.nomProyecto ?? '').trim()
    const searchGroupId = `${projectId.trim()} | ${projectName}`
    cobranzaBoardId.value = board.id
    composedGroupName.value = searchGroupId
    selectedGroupColor.value = colorsStore.availableColors[0] ?? '#266DD3'
    const searchUrl = new URL(`${API_BASE_URL}/groups/search`)
    searchUrl.searchParams.set('boardId', board.id)
    searchUrl.searchParams.set('groupName', searchGroupId)

    const groupsResponse = await fetch(searchUrl.toString())

    if (!groupsResponse.ok) {
      requestError.value = 'Error al obtener el detalle contable del proyecto'
      requestErrorDetail.value = 'No fue posible consultar los grupos contables del proyecto.'
      return
    }

    const groups = (await groupsResponse.json()) as ContabilityGroupDto[]

    if (groups.length > 1) {
      requestError.value =
        'Inconsistencia: No puede haber más de dos registros del proyecto en la parte contable'
      requestErrorDetail.value = 'Pongase en contacto con sistemas'
      inconsistentGroups.value = groups
      return
    }

    if (groups.length === 0) {
      emptyStateMessage.value = 'No se encontró información contable asociada a este proyecto.'
      return
    }

    const selectedGroup = groups[0]

    if (!selectedGroup) {
      emptyStateMessage.value = 'No se encontró información contable asociada a este proyecto.'
      return
    }

    await loadBoardGroupDetail(board.id, selectedGroup.id)
  } catch {
    requestError.value = 'Error al obtener el detalle contable del proyecto'
    requestErrorDetail.value = 'Ocurrió un error inesperado al cargar la sección contable.'
  } finally {
    if (requestId === activeRequestId) {
      isLoading.value = false
    }
  }
}

watch(
  () => props.projectId,
  async (newProjectId) => {
    await loadContabilityGroup(newProjectId)
  },
  { immediate: true },
)

const handleShowCreateGroupForm = () => {
  showCreateGroupForm.value = true
}

const createContabilityGroup = async () => {
  if (!cobranzaBoardId.value || !composedGroupName.value.trim() || !selectedGroupColor.value) {
    return
  }

  isCreatingGroup.value = true
  requestError.value = ''
  requestErrorDetail.value = ''

  try {
    const payload: CreateContabilityGroupPayload = {
      boardId: cobranzaBoardId.value,
      name: composedGroupName.value,
      color: selectedGroupColor.value,
    }

    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      requestError.value = 'Error al crear el registro contable'
      requestErrorDetail.value = 'No fue posible crear el grupo en cobranza.'
      return
    }

    const createdGroup = (await response.json()) as ContabilityGroupDto

    if (!createdGroup.id) {
      requestError.value = 'Error al crear el registro contable'
      requestErrorDetail.value = 'La respuesta de creación no devolvió un identificador de grupo.'
      return
    }

    emptyStateMessage.value = ''
    showCreateGroupForm.value = false
    await loadBoardGroupDetail(cobranzaBoardId.value, createdGroup.id)
  } catch {
    requestError.value = 'Error al crear el registro contable'
    requestErrorDetail.value = 'Ocurrió un error inesperado al crear el registro contable.'
  } finally {
    isCreatingGroup.value = false
  }
}
</script>

<template>
  <section class="contability-section">
    <p v-if="!props.projectId" class="contability-section__status">
      Para la parte contable debes de asignar un proyecto
    </p>

    <section v-else>
      <section v-if="isLoading" class="contability-section__loader">
        <LoaderComponent />
      </section>

      <section
        v-else-if="requestError"
        class="contability-section__error-wrapper"
        role="alert"
        aria-live="assertive"
      >
        <p class="contability-section__status contability-section__status--error">
          {{ requestError }}
        </p>
        <p
          v-if="requestErrorDetail"
          class="contability-section__status contability-section__status--error-detail"
        >
          {{ requestErrorDetail }}
        </p>

        <ul v-if="inconsistentGroups.length > 0" class="contability-section__groups-list">
          <li
            v-for="group in inconsistentGroups"
            :key="group.id"
            class="contability-section__group-item"
          >
            <span class="contability-section__group-name">{{ group.name }}</span>
            <span class="contability-section__group-meta">ID: {{ group.id }}</span>
          </li>
        </ul>
      </section>

      <section v-else-if="emptyStateMessage" class="contability-section__empty-card">
        <section class="contability-section__empty-header">
          <p v-if="!showCreateGroupForm" class="contability-section__status">
            {{ emptyStateMessage }}
          </p>
          <button
            v-if="!showCreateGroupForm"
            type="button"
            class="contability-section__create-button"
            @click="handleShowCreateGroupForm"
          >
            Crear registro en cobranza
          </button>
        </section>

        <section v-if="showCreateGroupForm" class="contability-section__create-form">
          <label class="contability-section__field-label" for="contability-group-name"
            >Nombre</label
          >
          <input
            id="contability-group-name"
            class="contability-section__field-input"
            type="text"
            :value="composedGroupName"
            readonly
          />

          <label class="contability-section__field-label" for="contability-group-colors"
            >Color</label
          >
          <section id="contability-group-colors" class="contability-section__color-picker">
            <button
              v-for="color in colorsStore.availableColors"
              :key="color"
              type="button"
              class="contability-section__color-circle"
              :class="{
                'contability-section__color-circle--selected': selectedGroupColor === color,
              }"
              :style="{ backgroundColor: color }"
              :aria-label="`Seleccionar color ${color}`"
              @click="selectedGroupColor = color"
            ></button>
          </section>

          <button
            type="button"
            class="contability-section__submit-button"
            :disabled="isCreatingGroup"
            @click="createContabilityGroup"
          >
            {{ isCreatingGroup ? 'Creando...' : 'Crear registro contable' }}
          </button>
        </section>
      </section>

      <BoardGroupDetail v-else-if="groupDetail" :group="groupDetail" :groups="[]" />
    </section>
  </section>
</template>

<style scoped>
.contability-section {
  padding: 16px;
}

.contability-section__loader {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.contability-section__status {
  margin: 0;
  color: var(--dark-color);
  font-size: 0.92rem;
}

.contability-section__status--error {
  color: #d7263d;
  font-weight: 600;
}

.contability-section__status--error-detail {
  color: #d7263d;
  margin-top: 4px;
}

.contability-section__error-wrapper {
  display: grid;
  gap: 4px;
}

.contability-section__groups-list {
  margin: 10px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 6px;
}

.contability-section__group-item {
  display: grid;
  color: var(--dark-color);
}

.contability-section__group-name {
  font-size: 0.9rem;
}

.contability-section__group-meta {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.contability-section__empty-card {
  border: 1px solid var(--shadow-color);
  border-radius: 10px;
  padding: 14px;
  background-color: var(--sec-color);
  display: grid;
  gap: 12px;
}

.contability-section__empty-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.contability-section__create-button,
.contability-section__submit-button {
  border: 1px solid var(--contrast-color);
  background-color: var(--contrast-color);
  color: var(--main-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.88rem;
  cursor: pointer;
}

.contability-section__create-form {
  display: grid;
  gap: 8px;
}

.contability-section__field-label {
  font-size: 0.85rem;
  color: var(--dark-color);
}

.contability-section__field-input {
  border: 1px solid var(--ter-color);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 0.9rem;
  color: var(--dark-color);
  background-color: var(--main-color);
}

.contability-section__color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.contability-section__color-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.contability-section__color-circle--selected {
  border-color: var(--dark-color);
  box-shadow: 0 0 0 2px var(--main-color);
}

.contability-section__submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

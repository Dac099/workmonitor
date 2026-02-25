<script lang="ts" setup>
import { ref, watch } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import ProjectSearchSelect from '@/shared/components/ProjectSearchSelect.vue'
import type { ProjectSearchItem } from '@/shared/types/project'

interface ProjectDto {
  idProyect: string
  nomProyecto: string | null
  nomCliente: string | null
  idCliente: number | null
}

interface UpdateItemProjectPayload {
  projectId: string | null
}

type Props = {
  projectId: string | null
  itemId: string
}

const props = defineProps<Props>()

const selectedProject = ref<ProjectSearchItem | null>(null)
const project = ref<ProjectDto | null>(null)
const isLoadingProject = ref(false)
const isUpdatingProject = ref(false)
const requestError = ref('')
const PROJECT_DETAIL_ERROR_MESSAGE = 'Error al obtener el detalle del proyecto'

const getProjectById = async (projectId: string) => {
  isLoadingProject.value = true
  requestError.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/proyects/${encodeURIComponent(projectId)}`)

    if (!response.ok) {
      requestError.value = PROJECT_DETAIL_ERROR_MESSAGE
      project.value = null
      return
    }

    const data = (await response.json()) as ProjectDto | null

    if (!data || !data.idProyect) {
      project.value = null
      return
    }

    project.value = data
  } catch {
    requestError.value = PROJECT_DETAIL_ERROR_MESSAGE
    project.value = null
  } finally {
    isLoadingProject.value = false
  }
}

const updateItemProject = async (projectId: string | null) => {
  isUpdatingProject.value = true
  requestError.value = ''

  try {
    const payload: UpdateItemProjectPayload = {
      projectId,
    }

    const response = await fetch(`${API_BASE_URL}/items/${props.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      requestError.value = 'No fue posible actualizar el proyecto del item.'
      return
    }

    if (!projectId) {
      project.value = null
      selectedProject.value = null
      return
    }

    await getProjectById(projectId)
    selectedProject.value = null
  } catch {
    requestError.value = 'Ocurrió un error al actualizar el item.'
  } finally {
    isUpdatingProject.value = false
  }
}

watch(
  () => props.projectId,
  async (newProjectId) => {
    if (!newProjectId) {
      project.value = null
      requestError.value = ''
      selectedProject.value = null
      return
    }

    await getProjectById(newProjectId)
  },
  { immediate: true },
)

const handleConfirmProject = async () => {
  await updateItemProject(selectedProject.value?.idProyect ?? null)
}

const handleRemoveProject = async () => {
  const userConfirmed = window.confirm(
    '¿Deseas eliminar la asociación de este item con el proyecto?',
  )

  if (!userConfirmed) {
    return
  }

  await updateItemProject(null)
}
</script>

<template>
  <section class="project-section">
    <p v-if="isLoadingProject" class="project-section__status">Cargando proyecto...</p>

    <p v-else-if="requestError" class="project-section__status project-section__status--error">
      {{ requestError }}
    </p>

    <section v-else-if="project" class="project-section__card">
      <button
        class="project-section__remove-button"
        type="button"
        title="Eliminar asociación al proyecto"
        aria-label="Eliminar asociación al proyecto"
        :disabled="isUpdatingProject"
        @click="handleRemoveProject"
      >
        <i class="nf nf-md-trash_can" aria-hidden="true"></i>
      </button>
      <p class="project-section__label">Proyecto vinculado</p>
      <h4 class="project-section__title">{{ project.nomProyecto || 'Sin nombre' }}</h4>
      <p class="project-section__meta" v-if="project.nomCliente">
        Cliente: {{ project.nomCliente }}
      </p>
      <p class="project-section__meta">ID Proyecto: {{ project.idProyect }}</p>
      <p class="project-section__meta" v-if="project.idCliente !== null">
        ID Cliente: {{ project.idCliente }}
      </p>
    </section>

    <section v-else class="project-section__search">
      <ProjectSearchSelect v-model="selectedProject" />
      <button
        v-if="selectedProject"
        class="project-section__confirm-button"
        type="button"
        :disabled="isUpdatingProject"
        @click="handleConfirmProject"
      >
        Confirmar
      </button>
      <p v-if="isUpdatingProject" class="project-section__status">
        Guardando proyecto en el item...
      </p>
    </section>
  </section>
</template>

<style scoped>
.project-section {
  padding: 16px;
}

.project-section__card {
  border: 1px solid var(--shadow-color);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--sec-color);
  display: grid;
  gap: 6px;
  position: relative;
}

.project-section__remove-button {
  position: absolute;
  top: 10px;
  right: 10px;
  border: 1px solid var(--ter-color);
  background-color: transparent;
  color: var(--dark-color);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.project-section__remove-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.project-section__label {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.project-section__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.project-section__meta {
  margin: 0;
  color: var(--dark-color);
  font-size: 0.9rem;
}

.project-section__status {
  margin: 0;
  font-size: 0.9rem;
  color: var(--dark-color);
}

.project-section__status--error {
  color: #d7263d;
}

.project-section__search {
  display: grid;
  gap: 10px;
}

.project-section__confirm-button {
  width: fit-content;
  border: 1px solid var(--contrast-color);
  background-color: var(--contrast-color);
  color: var(--main-color);
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 0.9rem;
  cursor: pointer;
}

.project-section__confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>

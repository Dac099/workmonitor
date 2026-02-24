<script lang="ts" setup>
import { ref, watch } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import ProjectSearchSelect from '@/shared/components/ProjectSearchSelect.vue'
import type { ProjectSearchItem } from '@/shared/types/project'

type ProjectDto = {
  idProyect: string
  nomProyecto: string | null
  nomCliente: string | null
  idCliente: number | null
}

type Props = {
  projectId: string | null
  itemId: string
}

const props = defineProps<Props>()

const currentProjectId = ref<string | null>(props.projectId)
const selectedProject = ref<ProjectSearchItem | null>(null)
const project = ref<ProjectDto | null>(null)
const isLoadingProject = ref(false)
const isUpdatingProject = ref(false)
const requestError = ref('')

const getProjectById = async (projectId: string) => {
  isLoadingProject.value = true
  requestError.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/proyects/${encodeURIComponent(projectId)}`)

    if (!response.ok) {
      requestError.value = 'No fue posible cargar el proyecto.'
      project.value = null
      return
    }

    const data = (await response.json()) as ProjectDto
    project.value = data
  } catch {
    requestError.value = 'Ocurrió un error al cargar el proyecto.'
    project.value = null
  } finally {
    isLoadingProject.value = false
  }
}

const updateItemProject = async (selected: ProjectSearchItem | null) => {
  if (!selected) {
    return
  }

  isUpdatingProject.value = true
  requestError.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/items/${props.itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: selected.idProyect,
      }),
    })

    if (!response.ok) {
      requestError.value = 'No fue posible actualizar el proyecto del item.'
      return
    }

    currentProjectId.value = selected.idProyect
    await getProjectById(selected.idProyect)
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
    currentProjectId.value = newProjectId

    if (!newProjectId) {
      project.value = null
      requestError.value = ''
      return
    }

    await getProjectById(newProjectId)
  },
  { immediate: true },
)

watch(selectedProject, async (newSelectedProject) => {
  await updateItemProject(newSelectedProject)
})
</script>

<template>
  <section class="project-section">
    <p v-if="isLoadingProject" class="project-section__status">Cargando proyecto...</p>

    <p v-else-if="requestError" class="project-section__status project-section__status--error">
      {{ requestError }}
    </p>

    <section v-else-if="project" class="project-section__card">
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
</style>

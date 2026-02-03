<script lang="ts" setup>
import { ref, type Ref, onMounted, computed } from 'vue'
import type { SubmitBoardDto, Board } from '../types/board'
import { API_BASE_URL } from '@/utils/contants'
import type { Workspace } from '../types/workspace'

const boardName: Ref<string> = ref('')
const boardDescription: Ref<string> = ref('')
const workspaceId: Ref<string> = ref('')
const showWorkspaceForm: Ref<boolean> = ref(false)
const newWorkspaceName: Ref<string> = ref('')
const newWorkspaceDescription: Ref<string> = ref('')
const workspaces: Ref<Array<Workspace>> = ref([])
const loadingWorkspaces: Ref<boolean> = ref(true)
const creatingWorkspace: Ref<boolean> = ref(false)
const creatingBoard: Ref<boolean> = ref(false)

const emit = defineEmits<{
  (e: 'submit', board: Board): void
  (e: 'error', error: string): void
}>()

const selectedWorkspace = computed(() => {
  return workspaces.value.find((w) => w.id === workspaceId.value)
})

onMounted(async () => {
  await fetchWorkspaces()
})

const fetchWorkspaces = async () => {
  try {
    loadingWorkspaces.value = true
    const response = await fetch(`${API_BASE_URL}/workspaces`)
    const data = await response.json()
    workspaces.value = data
  } catch (error) {
    console.error('Error al cargar workspaces:', error)
  } finally {
    loadingWorkspaces.value = false
  }
}

const handleSubmit = async () => {
  if (!boardName.value || !workspaceId.value) return

  try {
    creatingBoard.value = true
    const boardData: SubmitBoardDto = {
      name: boardName.value,
      workspaceId: workspaceId.value,
      description: boardDescription.value || null,
    }

    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(boardData),
    })

    if (!response.ok) {
      throw new Error('Error al crear el tablero')
    }

    const createdBoard: Board = await response.json()

    emit('submit', {
      ...createdBoard,
      workspaceName: selectedWorkspace.value?.name || '',
    })

    boardName.value = ''
    boardDescription.value = ''
    workspaceId.value = ''
  } catch (error) {
    console.error('Error al crear board:', error)
    emit('error', error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    creatingBoard.value = false
  }
}

const createWorkspace = async () => {
  if (!newWorkspaceName.value.trim()) return

  try {
    creatingWorkspace.value = true
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newWorkspaceName.value,
        description: newWorkspaceDescription.value || null,
      }),
    })

    if (response.ok) {
      const newWorkspace = await response.json()
      workspaces.value.push(newWorkspace)
      workspaceId.value = newWorkspace.id
      newWorkspaceName.value = ''
      newWorkspaceDescription.value = ''
      showWorkspaceForm.value = false
    }
  } catch (error) {
    console.error('Error al crear workspace:', error)
  } finally {
    creatingWorkspace.value = false
  }
}

const toggleWorkspaceForm = () => {
  showWorkspaceForm.value = !showWorkspaceForm.value
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="input-group">
      <label for="boardName">Nombre del tablero</label>
      <input type="text" name="boardName" id="boardName" v-model="boardName" required />
    </div>

    <div class="input-group">
      <label for="boardDescription">Descripción</label>
      <textarea
        name="boardDescription"
        id="boardDescription"
        v-model="boardDescription"
        rows="3"
        placeholder="Descripción del tablero (opcional)"
      ></textarea>
    </div>

    <div class="input-group">
      <div class="input-group--controls">
        <label for="workspace">Workspace</label>
        <i
          class="nf nf-fa-square_plus"
          @click="toggleWorkspaceForm"
          title="Crear nuevo workspace"
        ></i>
      </div>

      <div v-if="showWorkspaceForm" class="workspace-form">
        <input
          type="text"
          v-model="newWorkspaceName"
          placeholder="Nombre del workspace"
          autofocus
        />
        <textarea
          v-model="newWorkspaceDescription"
          placeholder="Descripción del workspace (opcional)"
          rows="2"
        ></textarea>
        <div class="workspace-form-controls">
          <button type="button" @click="createWorkspace" :disabled="creatingWorkspace">
            {{ creatingWorkspace ? 'Creando...' : 'Crear' }}
          </button>
          <button type="button" @click="toggleWorkspaceForm">Cancelar</button>
        </div>
      </div>

      <select name="workspace" id="workspace" v-model="workspaceId" required>
        <option value="">
          {{ loadingWorkspaces ? 'Cargando...' : 'Selecciona un workspace' }}
        </option>
        <option v-for="workspace in workspaces" :value="workspace.id" :key="workspace.id">
          {{ workspace.name }}
        </option>
      </select>
    </div>

    <div class="form-controls">
      <button type="submit" :disabled="!boardName || !workspaceId || creatingBoard">
        {{ creatingBoard ? 'Creando...' : 'Crear Tablero' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: var(--main-color);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--dark-color);
  text-transform: capitalize;
}

input[type='text'],
select,
textarea {
  padding: 0.75rem 1rem;
  border: 2px solid var(--ter-color);
  border-radius: 5px;
  font-size: 0.95rem;
  background-color: var(--sec-color);
  color: var(--dark-color);
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
}

textarea {
  resize: vertical;
  min-height: 60px;
}

input[type='text']:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--contrast-color);
  background-color: var(--main-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
}

input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--contrast-color);
}

.input-group input[type='checkbox'] {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.input-group small {
  font-size: 0.8rem;
  color: #666;
  font-weight: 400;
  margin-top: 0.25rem;
}

.form-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.input-group--controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: var(--dark-color);
}

.input-group--controls i {
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--contrast-color);
  transition: transform 0.2s ease;
}

.input-group--controls i:hover {
  transform: scale(1.1);
}

.workspace-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: var(--sec-color);
  border: 2px solid var(--ter-color);
  border-radius: 5px;
  margin-bottom: 0.5rem;
}

.workspace-form-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.workspace-form-controls button {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

button[type='submit'] {
  background-color: var(--contrast-color);
  color: var(--main-color);
}

button[type='submit']:hover:not(:disabled) {
  background-color: #1e6ed9;
  box-shadow: 0 4px 12px rgba(43, 130, 240, 0.3);
}

button[type='submit']:active:not(:disabled) {
  transform: scale(0.98);
}

button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button[type='button'] {
  background-color: var(--sec-color);
  color: var(--dark-color);
  border: 2px solid var(--ter-color);
}

button[type='button']:hover {
  background-color: var(--ter-color);
  border-color: #bbb;
}

button[type='button']:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  form {
    padding: 1.5rem;
    gap: 1.25rem;
    min-width: max-content;
  }

  .form-controls {
    flex-direction: column-reverse;
  }

  button {
    width: 100%;
  }
}
</style>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import SideBar from '@/shared/components/SideBar.vue'
import { API_BASE_URL } from '@/utils/contants'
import { useDebounce } from '@/shared/composables/useDebounce'
import type { ItemDetail } from '../types/items'

interface Project {
  idProyect: string
  nomProyecto?: string
  nomCliente?: string
  idCliente?: number
}

interface Props {
  visible: boolean
  groupId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', item: ItemDetail): void
  (e: 'update:visible', value: boolean): void
}>()

const isLoading = ref(false)
const isSearching = ref(false)
const itemName = ref('')
const searchQuery = ref('')
const selectedProject = ref<Project | null>(null)
const searchResults = ref<Project[]>([])

// Debounce search query
const debouncedSearch = useDebounce(searchQuery, 300)

// Watch debounced value to trigger API call
watch(debouncedSearch, async (query) => {
  if (!query || query.trim().length === 0) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/proyects/search/${encodeURIComponent(query)}`)
    if (response.ok) {
      const data = await response.json()
      // Pagination limit 15 (client-side)
      searchResults.value = Array.isArray(data) ? data.slice(0, 15) : []
    } else {
      searchResults.value = []
    }
  } catch (error) {
    console.error('Search failed', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
})

const handleClose = () => {
  itemName.value = ''
  searchQuery.value = ''
  selectedProject.value = null
  searchResults.value = []
  emit('close')
  emit('update:visible', false)
}

const selectProject = (project: Project) => {
  selectedProject.value = project
  searchQuery.value = project.nomProyecto || ''
  searchResults.value = [] // Close results dropdown
}

const clearProject = () => {
  selectedProject.value = null
  searchQuery.value = ''
}

const submit = async () => {
  if (!itemName.value.trim()) return
  isLoading.value = true

  try {
    const payload = {
      groupId: props.groupId,
      name: itemName.value,
      projectId: selectedProject.value?.idProyect,
    }

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to create item: ${response.statusText}`)
    }

    const newItem = await response.json()
    emit('created', {
      ...newItem,
      values: [],
      chats: [],
    })

    // Reset form
    itemName.value = ''
    searchQuery.value = ''
    selectedProject.value = null

    handleClose()
  } catch (error) {
    console.error('Failed to create item', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <SideBar :is-open="props.visible" @close="handleClose">
    <template #header>
      <h3>Agregar Item</h3>
    </template>

    <div class="form-container">
      <div class="form-group">
        <label>Nombre del Item</label>
        <input
          v-model="itemName"
          type="text"
          class="form-input"
          placeholder="Escribe el nombre del item"
        />
      </div>

      <div class="form-group search-group">
        <label>Buscar Proyecto (Opcional)</label>
        <input
          v-model="searchQuery"
          type="text"
          class="form-input"
          placeholder="Buscar proyecto..."
          @focus="searchResults = []"
        />

        <div v-if="selectedProject" class="project-card">
          <div class="project-card-content">
            <span class="project-card-label">Proyecto Seleccionado</span>
            <div class="project-card-title">{{ selectedProject.nomProyecto }}</div>
            <div class="project-card-client" v-if="selectedProject.nomCliente">
              Cliente: {{ selectedProject.nomCliente }}
            </div>
            <div class="project-card-ids">
              <span class="id-tag">ID: {{ selectedProject.idProyect }}</span>
            </div>
          </div>
          <button class="clear-project-btn" @click="clearProject">✕</button>
        </div>

        <div v-if="isSearching" class="search-loading">Buscando...</div>

        <ul v-if="searchResults.length > 0 && !selectedProject" class="search-results">
          <li
            v-for="project in searchResults"
            :key="project.idProyect"
            class="search-result-item"
            @click="selectProject(project)"
          >
            <div class="project-name">{{ project.nomProyecto }}</div>
            <div class="client-name" v-if="project.nomCliente">{{ project.nomCliente }}</div>
          </li>
        </ul>
      </div>

      <button class="submit-btn" :disabled="!itemName.trim() || isLoading" @click="submit">
        {{ isLoading ? 'Creando...' : 'Crear Item' }}
      </button>
    </div>
  </SideBar>
</template>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--dark-color);
}

.form-input {
  padding: 0.8rem;
  border: 1px solid var(--shadow-color);
  border-radius: 4px;
  background-color: var(--sec-color);
  color: var(--dark-color);
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--contrast-color);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--shadow-color);
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.1s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: var(--sec-color);
}

.project-name {
  font-weight: 500;
  color: var(--dark-color);
}

.client-name {
  font-size: 0.8rem;
  color: #666;
}

.project-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  margin-top: 0.5rem;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--contrast-color);
}

.project-card:hover {
  border-color: #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.project-card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.project-card-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #888;
  font-weight: 600;
  margin-bottom: 2px;
}

.project-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
  line-height: 1.3;
}

.project-card-client {
  font-size: 0.85rem;
  color: #555;
  margin-top: 2px;
}

.project-card-ids {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.id-tag {
  font-size: 0.75rem;
  color: #777;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.clear-project-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.clear-project-btn:hover {
  color: #e53935;
  background-color: rgba(229, 57, 53, 0.1);
}

.search-loading {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.2rem;
}

.submit-btn {
  margin-top: 1rem;
  padding: 0.8rem;
  background-color: var(--contrast-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

h3 {
  margin: 0;
  color: var(--dark-color);
  font-weight: 600;
}
</style>

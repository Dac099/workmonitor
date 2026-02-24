<script setup lang="ts">
import { ref, watch } from 'vue'
import { API_BASE_URL } from '@/utils/contants'
import { useDebounce } from '@/shared/composables/useDebounce'
import type { ProjectSearchItem } from '@/shared/types/project'

type Props = {
  modelValue: ProjectSearchItem | null
  label?: string
  placeholder?: string
}

type Emits = {
  'update:modelValue': [project: ProjectSearchItem | null]
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Buscar Proyecto (Opcional)',
  placeholder: 'Buscar proyecto...',
})

const emit = defineEmits<Emits>()

const searchQuery = ref(props.modelValue?.nomProyecto ?? '')
const searchResults = ref<ProjectSearchItem[]>([])
const isSearching = ref(false)
const debouncedSearch = useDebounce(searchQuery, 300)

watch(
  () => props.modelValue,
  (project) => {
    searchQuery.value = project?.nomProyecto ?? ''
    if (!project) {
      searchResults.value = []
    }
  },
)

watch(debouncedSearch, async (query) => {
  if (props.modelValue) {
    return
  }

  if (!query || query.trim().length === 0) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const response = await fetch(`${API_BASE_URL}/proyects/search/${encodeURIComponent(query)}`)
    if (!response.ok) {
      searchResults.value = []
      return
    }

    const data = await response.json()
    searchResults.value = Array.isArray(data) ? data.slice(0, 15) : []
  } catch (error) {
    console.error('Search failed', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
})

const selectProject = (project: ProjectSearchItem) => {
  emit('update:modelValue', project)
  searchQuery.value = project.nomProyecto ?? ''
  searchResults.value = []
}

const clearProject = () => {
  emit('update:modelValue', null)
  searchQuery.value = ''
  searchResults.value = []
}

const clearResultsOnFocus = () => {
  if (props.modelValue) {
    return
  }

  searchResults.value = []
}
</script>

<template>
  <div class="project-search-select form-group search-group">
    <label>{{ label }}</label>
    <input
      v-model="searchQuery"
      type="text"
      class="form-input"
      :placeholder="placeholder"
      @focus="clearResultsOnFocus"
    />

    <div v-if="modelValue" class="project-search-select__card">
      <div class="project-search-select__card-content">
        <span class="project-search-select__card-label">Proyecto Seleccionado</span>
        <div class="project-search-select__card-title">{{ modelValue.nomProyecto }}</div>
        <div class="project-search-select__card-client" v-if="modelValue.nomCliente">
          Cliente: {{ modelValue.nomCliente }}
        </div>
        <div class="project-search-select__card-ids">
          <span class="project-search-select__id-tag">ID: {{ modelValue.idProyect }}</span>
        </div>
      </div>
      <button type="button" class="project-search-select__clear-btn" @click="clearProject">
        ✕
      </button>
    </div>

    <div v-if="isSearching" class="project-search-select__loading">Buscando...</div>

    <ul v-if="searchResults.length > 0 && !modelValue" class="project-search-select__results">
      <li
        v-for="project in searchResults"
        :key="project.idProyect"
        class="project-search-select__result-item"
        @click="selectProject(project)"
      >
        <div class="project-search-select__result-name">{{ project.nomProyecto }}</div>
        <div class="project-search-select__result-client" v-if="project.nomCliente">
          {{ project.nomCliente }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
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

.project-search-select__results {
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

.project-search-select__result-item {
  padding: 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background 0.1s;
}

.project-search-select__result-item:last-child {
  border-bottom: none;
}

.project-search-select__result-item:hover {
  background-color: var(--sec-color);
}

.project-search-select__result-name {
  font-weight: 500;
  color: var(--dark-color);
}

.project-search-select__result-client {
  font-size: 0.8rem;
  color: #666;
}

.project-search-select__card {
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

.project-search-select__card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--contrast-color);
}

.project-search-select__card:hover {
  border-color: #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.project-search-select__card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.project-search-select__card-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #888;
  font-weight: 600;
  margin-bottom: 2px;
}

.project-search-select__card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
  line-height: 1.3;
}

.project-search-select__card-client {
  font-size: 0.85rem;
  color: #555;
  margin-top: 2px;
}

.project-search-select__card-ids {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.project-search-select__id-tag {
  font-size: 0.75rem;
  color: #777;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.project-search-select__clear-btn {
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

.project-search-select__clear-btn:hover {
  color: #e53935;
  background-color: rgba(229, 57, 53, 0.1);
}

.project-search-select__loading {
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.2rem;
}
</style>

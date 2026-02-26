<script setup lang="ts">
import { ref } from 'vue'
import type { SearcherResponse } from '../types/searcher'
import { API_BASE_URL } from '@/utils/contants'

interface Props {
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  search: [results: SearcherResponse]
  loading: [isLoading: boolean]
  error: [error: string]
}>()

const isExpanded = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
const searchError = ref('')

const expandSearch = () => {
  isExpanded.value = true
  setTimeout(() => {
    const input = document.querySelector('.general-search__input') as HTMLInputElement
    input?.focus()
  }, 50)
}

const collapseSearch = () => {
  isExpanded.value = false
  searchQuery.value = ''
  searchError.value = ''
}

const handleSearchSubmit = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    return
  }

  isSearching.value = true
  searchError.value = ''
  emit('loading', true)

  try {
    const encodedQuery = encodeURIComponent(query)
    const response = await fetch(`${API_BASE_URL}/searcher?query=${encodedQuery}`)

    if (!response.ok) {
      throw new Error('Error al realizar la búsqueda')
    }

    const data: SearcherResponse = await response.json()
    emit('search', data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    searchError.value = errorMessage
    emit('error', errorMessage)
  } finally {
    isSearching.value = false
    emit('loading', false)
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearchSubmit()
  } else if (event.key === 'Escape') {
    collapseSearch()
  }
}
</script>

<template>
  <div class="general-search" :class="{ 'general-search--expanded': isExpanded }">
    <!-- Search Icon Button -->
    <button
      v-if="!isExpanded"
      class="general-search__icon-btn"
      type="button"
      aria-label="Abrir búsqueda"
      @click="expandSearch"
      title="Buscar"
    >
      <i class="nf nf-fa-search"></i>
    </button>

    <!-- Expanded Search Bar -->
    <div v-if="isExpanded" class="general-search__expanded">
      <div class="general-search__input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          class="general-search__input"
          placeholder="Buscar tableros, grupos, items..."
          :disabled="isSearching"
          @keydown="handleKeyDown"
        />
        <button
          v-if="searchQuery"
          class="general-search__clear-btn"
          type="button"
          aria-label="Limpiar búsqueda"
          @click="searchQuery = ''"
          title="Limpiar"
        >
          <i class="nf nf-fa-times"></i>
        </button>
      </div>

      <div class="general-search__actions">
        <button
          class="general-search__submit-btn"
          type="button"
          :disabled="!searchQuery.trim() || isSearching"
          @click="handleSearchSubmit"
          title="Buscar"
        >
          <i v-if="!isSearching" class="nf nf-fa-search"></i>
          <i v-else class="nf nf-cod-loading"></i>
        </button>

        <button
          class="general-search__close-btn"
          type="button"
          aria-label="Cerrar búsqueda"
          :disabled="isSearching"
          @click="collapseSearch"
          title="Cerrar"
        >
          <i class="nf nf-fa-times"></i>
        </button>
      </div>

      <div v-if="searchError" class="general-search__error">
        {{ searchError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.general-search {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 0.5rem;
}

.general-search__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background-color: transparent;
  color: var(--light-dark-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border-radius: 3px;
  padding: 0;
}

.general-search__icon-btn:hover {
  background-color: var(--dark-color);
  color: white;
}

.general-search--expanded .general-search__icon-btn {
  display: none;
}

.general-search__expanded {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
}

.general-search__input-wrapper {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.general-search__input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--ter-color);
  border-radius: 3px;
  font-size: 0.85rem;
  font-family: 'Poppins', sans-serif;
  transition: all 0.2s ease;
  background-color: var(--main-color);
  color: var(--dark-color);
}

.general-search__input:focus {
  outline: none;
  border-color: var(--contrast-color);
  box-shadow: 0 0 0 2px rgba(43, 130, 240, 0.1);
}

.general-search__input:disabled {
  background-color: var(--sec-color);
  cursor: not-allowed;
  opacity: 0.6;
}

.general-search__clear-btn {
  position: absolute;
  right: 0.4rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--light-dark-color);
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.general-search__clear-btn:hover {
  color: var(--dark-color);
}

.general-search__actions {
  display: flex;
  gap: 0.3rem;
}

.general-search__submit-btn,
.general-search__close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--ter-color);
  background-color: var(--main-color);
  color: var(--dark-color);
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  padding: 0;
}

.general-search__submit-btn:hover:not(:disabled) {
  background-color: var(--contrast-color);
  color: white;
  border-color: var(--contrast-color);
}

.general-search__close-btn:hover:not(:disabled) {
  background-color: var(--sec-color);
}

.general-search__submit-btn:disabled,
.general-search__close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.general-search__error {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.3rem;
  padding: 0.4rem 0.6rem;
  background-color: #ffebee;
  color: #c62828;
  font-size: 0.75rem;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scaleX(0.8);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

@media (max-width: 600px) {
  .general-search__expanded {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--main-color);
    padding: 0.5rem;
    border: 1px solid var(--ter-color);
    border-radius: 3px;
    margin-top: 0.3rem;
    z-index: 1000;
    gap: 0;
    flex-direction: column;
  }

  .general-search__input-wrapper {
    max-width: 100%;
    width: 100%;
    margin-bottom: 0.3rem;
  }

  .general-search__actions {
    width: 100%;
    gap: 0.3rem;
  }

  .general-search__submit-btn,
  .general-search__close-btn {
    flex: 1;
  }
}
</style>

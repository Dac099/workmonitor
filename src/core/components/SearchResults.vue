<script setup lang="ts">
import { computed } from 'vue'
import type { SearcherResponse, SearchBoardResult, SearchGroupResult } from '../types/searcher'
import SideBar from '@/shared/components/SideBar.vue'
import type { Group } from '@/modules/boards/types/groups'
import type { Board } from '@/modules/boards/types/board'

interface Props {
  isOpen: boolean
  results: SearcherResponse | null
  boards?: Board[]
  groups?: Group[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  groupSelect: [boardId: string, groupId: string]
  itemSelect: [boardId: string, groupId: string, itemId: string]
}>()

// Helper function to find board by ID
const getBoardById = (boardId: string): SearchBoardResult | undefined => {
  return props.results?.boards.find((b) => b.id === boardId)
}

// Helper function to find group by ID
const getGroupById = (groupId: string): SearchGroupResult | undefined => {
  return props.results?.groups.find((g) => g.id === groupId)
}

// Computed properties for each result type
const groupResults = computed(() => props.results?.groups || [])
const itemResults = computed(() => props.results?.items || [])

// Check if there are any results
const hasResults = computed(() => {
  return groupResults.value.length > 0 || itemResults.value.length > 0
})

const handleGroupClick = (boardId: string, groupId: string) => {
  emit('itemSelect', boardId, groupId, '')
}

const handleItemClick = (boardId: string, groupId: string, itemId: string) => {
  emit('itemSelect', boardId, groupId, itemId)
}
</script>

<template>
  <SideBar :is-open="isOpen" :initial-width="800" @close="emit('close')">
    <template #header>
      <div class="search-results__header">
        <h2 class="search-results__title">Resultados de búsqueda</h2>
      </div>
    </template>

    <template #default>
      <div class="search-results__content">
        <!-- Empty State -->
        <div v-if="!hasResults" class="search-results__empty">
          <p>No se encontraron resultados</p>
        </div>

        <!-- Items Section -->
        <div v-if="itemResults.length > 0" class="search-results__section">
          <h3 class="search-results__section-title">Items</h3>
          <ul class="search-results__list">
            <li v-for="item in itemResults" :key="item.id" class="search-results__item">
              <button
                type="button"
                class="search-results__link"
                @click="
                  handleItemClick(getGroupById(item.groupId)?.boardId || '', item.groupId, item.id)
                "
                :title="`Ir a item: ${item.name}`"
              >
                <span class="search-results__icon">
                  <i class="nf nf-fa-file"></i>
                </span>
                <span class="search-results__text">
                  <span class="search-results__name">{{ item.name }}</span>
                  <span class="search-results__breadcrumb">
                    [{{
                      getBoardById(getGroupById(item.groupId)?.boardId || '')?.name ||
                      'Tablero desconocido'
                    }}] [{{ getGroupById(item.groupId)?.name || 'Grupo desconocido' }}]
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Groups Section -->
        <div v-if="groupResults.length > 0" class="search-results__section">
          <h3 class="search-results__section-title">Grupos</h3>
          <ul class="search-results__list">
            <li v-for="group in groupResults" :key="group.id" class="search-results__item">
              <button
                type="button"
                class="search-results__link"
                @click="handleGroupClick(group.boardId, group.id)"
                :title="`Ir a grupo: ${group.name}`"
              >
                <span class="search-results__icon">
                  <i class="nf nf-fa-folder"></i>
                </span>
                <span class="search-results__text">
                  <span class="search-results__name">{{ group.name }}</span>
                  <span class="search-results__breadcrumb">
                    [{{ getBoardById(group.boardId)?.name || 'Tablero desconocido' }}]
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </SideBar>
</template>

<style scoped>
.search-results__header {
  padding: 1rem;
  border-bottom: 1px solid var(--ter-color);
  background-color: var(--sec-color);
}

.search-results__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark-color);
}

.search-results__content {
  padding: 0;
  overflow-y: auto;
  height: 100%;
}

.search-results__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: var(--light-dark-color);
  font-size: 0.9rem;
}

.search-results__section {
  border-bottom: 1px solid var(--ter-color);
  padding: 0;
}

.search-results__section:last-child {
  border-bottom: none;
}

.search-results__section-title {
  padding: 0.75rem 1rem;
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--light-dark-color);
  background-color: var(--sec-color);
  border-bottom: 1px solid var(--ter-color);
}

.search-results__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-results__item {
  margin: 0;
  padding: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-results__item:last-child {
  border-bottom: none;
}

.search-results__link {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--dark-color);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 0.85rem;
}

.search-results__link:hover {
  background-color: var(--sec-color);
  padding-left: 1.25rem;
}

.search-results__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  color: var(--contrast-color);
  font-size: 0.8rem;
  margin-top: 0.1rem;
}

.search-results__text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.search-results__name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.search-results__breadcrumb {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--light-dark-color);
  font-weight: 400;
}

@media (max-width: 768px) {
  .search-results__link {
    padding: 0.6rem 0.8rem;
  }

  .search-results__link:hover {
    padding-left: 1rem;
  }
}
</style>

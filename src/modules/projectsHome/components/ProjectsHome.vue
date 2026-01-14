<script setup lang="ts">
import { computed, type Ref, ref } from 'vue'
import { type Board } from '../types/board'
import { useRouter } from 'vue-router'
import getDateString from '@/utils/transformers'
import Sidebar from '@/shared/SideBar.vue'
import BoardForm from './BoardForm.vue'

const router = useRouter()
const isSidebarOpen: Ref<boolean> = ref(false)
const boards: Ref<Board[]> = ref([
  {
    id: 1,
    name: 'Proyectos 2025',
    category: 'Proyectos',
    createdAt: new Date(),
    ownerId: 1,
  },
  {
    id: 2,
    name: 'Global Planning',
    category: 'Proyectos',
    createdAt: new Date(),
    ownerId: 1,
  },
  {
    id: 3,
    name: 'Personal Goals',
    category: 'Proyectos',
    createdAt: new Date(),
    ownerId: 2,
  },
  {
    id: 4,
    name: 'Manager Team',
    category: 'Marketing',
    createdAt: new Date(),
    ownerId: 2,
  },
  {
    id: 5,
    name: 'Development Sprint',
    category: 'Desarrollo',
    createdAt: new Date(),
    ownerId: 1,
  },
])
const activeFilter: Ref<'all' | 'personal'> = ref('all')

const filteredBoards = computed(() => {
  if (activeFilter.value === 'all') {
    return boards.value
  } else {
    return boards.value.filter((board) => board.ownerId === 2)
  }
})

const isTabActive = (tab: 'all' | 'personal') => {
  return activeFilter.value === tab
}

const setFilter = (filter: 'all' | 'personal') => {
  activeFilter.value = filter
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const openSidebar = () => {
  isSidebarOpen.value = true
}

const addNewBoard = (newBoard: Omit<Board, 'id'>) => {
  boards.value.push({
    id: boards.value.length + 1,
    ...newBoard,
  })
}

const goToBoard = (boardId: number) => {
  router.push(`/projects/boards/${boardId}`)
}
</script>

<template>
  <article class="main-container">
    <article class="data-container">
      <section class="container--header">
        <h1>Tableros</h1>
      </section>
      <section class="boards-controllers">
        <div>
          <button
            type="button"
            :class="isTabActive('all') ? 'active-tab' : ''"
            @click="setFilter('all')"
          >
            Todos
          </button>
          <button
            type="button"
            :class="isTabActive('personal') ? 'active-tab' : ''"
            @click="setFilter('personal')"
          >
            Personales
          </button>
        </div>
        <button type="button" @click="openSidebar()">Agregar tablero</button>
      </section>
      <section class="boards-grid">
        <article
          v-for="board in filteredBoards"
          :key="board.id"
          class="boards-grid--card"
          @click="goToBoard(board.id)"
        >
          <div class="card-header">
            <i class="nf nf-fa-table_list icon"></i>
            <h4>{{ board.name }}</h4>
          </div>
          <p>{{ board.category }}</p>
          <p class="card--date">{{ getDateString(board.createdAt) }}</p>
        </article>
      </section>
    </article>
  </article>
  <Sidebar :is-open="isSidebarOpen" @close="closeSidebar">
    <template #header>
      <h2>Nuevo Tablero</h2>
    </template>

    <BoardForm />
  </Sidebar>
</template>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

h1,
h2 {
  color: var(--dark-color);
  margin-bottom: 15px;
}

.data-container {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.boards-controllers {
  width: 100%;
  height: max-content;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.active-tab {
  background-color: var(--dark-color);
  color: var(--main-color);
}

.boards-controllers div button:first-child {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.boards-controllers > button:last-child {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: none;
}

button {
  cursor: pointer;
  color: var(--dark-color);
  padding: 5px;
  outline: none;
  border: none;
  transition: all 250ms ease-in-out;
  border-right: 1px solid var(--shadow-color);
}

button:hover {
  transform: scale(1.2);
  border-radius: 0;
  color: var(--main-color);
  background-color: var(--dark-color);
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.boards-grid--card {
  background-color: var(--sec-color);
  border: 1px solid var(--ter-color);
  border-radius: 5px;
  padding: 10px 16px;
  transition: transform 0.2s;
  cursor: pointer;
}

.boards-grid--card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px var(--shadow-color);
  border-radius: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  color: var(--contrast-color);
}

.card--date {
  color: var(--ter-color);
  font-size: 0.8rem;
  text-align: right;
  margin-top: 15px;
}
</style>
